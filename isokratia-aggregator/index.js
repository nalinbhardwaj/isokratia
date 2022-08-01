import fs from "fs";
import mimcHash from "./mimc.js";
import fetch from "node-fetch";

function getPastSnark(proposal, option) {
  const proofFileName = `input/${proposal.id}-${option}-proof.json`;
  const voterFileName = `input/${proposal.id}-${option}-voters.json`;
  try {
    const proofFs = fs.readFileSync(proofFileName);
    const votersFs = fs.readFileSync(voterFileName);
    const proofData = JSON.parse(proofFs);
    const voterData = JSON.parse(votersFs);
    console.log(proofData, voterData);
    return { pastProof: proofData, pastVoters: voterData };
  } catch (err) {
    // console.log("caught err", err);
    const proofData = JSON.parse(fs.readFileSync("input/blank-proof.json"));
    const voterData = [];
    return { pastProof: proofData, pastVoters: voterData };
  }
}

function writeSnark(proposal, option, proof, voters) {
  const proofFileName = `input/${proposal.id}-${option}-proof.json`;
  const voterFileName = `input/${proposal.id}-${option}-voters.json`;
  fs.writeFileSync(proofFileName, JSON.stringify(proof));
  fs.writeFileSync(voterFileName, JSON.stringify(voters));
}

// bigendian
function bigint_to_Uint8Array(x) {
  var ret = new Uint8Array(32);
  for (var idx = 31; idx >= 0; idx--) {
    ret[idx] = Number(x % 256n);
    x = x / 256n;
  }
  return ret;
}

// bigendian
function Uint8Array_to_bigint(x) {
  var ret = 0n;
  for (var idx = 0; idx < x.length; idx++) {
    ret = ret * 256n;
    ret = ret + BigInt(x[idx]);
  }
  return ret;
}

const fromHexString = (hexString) =>
  new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const intToHex = (intString) => ethers.BigNumber.from(intString).toHexString();

const hexStringTobigInt = (hexString) => {
  return Uint8Array_to_bigint(fromHexString(hexString));
};

function bigint_to_array(n, k, x) {
  let mod = 1n;
  for (var idx = 0; idx < n; idx++) {
    mod = mod * 2n;
  }

  let ret = [];
  var x_temp = x;
  for (var idx = 0; idx < k; idx++) {
    ret.push(x_temp % mod);
    x_temp = x_temp / mod;
  }
  return ret;
}

function parsePubkey(pk) {
  const sliced_pk = pk.slice(4);
  const pk_x_hex = sliced_pk.slice(0, 64);
  const pk_y_hex = sliced_pk.slice(64, 128);
  const pk_x_bigint = hexStringTobigInt(pk_x_hex);
  const pk_y_bigint = hexStringTobigInt(pk_y_hex);
  const pk_x_arr = bigint_to_array(64, 4, pk_x_bigint);
  const pk_y_arr = bigint_to_array(64, 4, pk_y_bigint);
  console.log("pk stuff", pk, pk_x_arr, pk_y_arr);
  return [pk_x_arr.map((x) => x.toString()), pk_y_arr.map((x) => x.toString())];
}

function parseSig(sig) {
  const r = sig.slice(0, 32);
  const s = sig.slice(32, 64);
  var r_bigint = Uint8Array_to_bigint(r);
  var s_bigint = Uint8Array_to_bigint(s);
  var r_array = bigint_to_array(64, 4, r_bigint);
  var s_array = bigint_to_array(64, 4, s_bigint);
  return [r_array.map((x) => x.toString()), s_array.map((x) => x.toString())];
}

const mimcHasher = mimcHash(123);

function commitmentComputer(
  voteCount,
  eligibleRoot,
  voterRoot,
  msghash,
  proof
) {
  return mimcHasher(
    voteCount,
    eligibleRoot,
    voterRoot,
    ...msghash,
    ...proof.negalfa1xbeta2.flat(20),
    ...proof.gamma2.flat(20),
    ...proof.delta2.flat(20),
    ...proof.IC.flat(20)
  );
}

function processVote(proposal, option, vote, pastProof, pastVoters) {
  console.log("processing vote", vote);
  const msg =
    "isokratia vote " + vote.vote + " for proposal " + vote.proposal_id;
  const msghash_bigint = Uint8Array_to_bigint(keccak256(msg));
  const msghash = bigint_to_Uint8Array(msghash_bigint);
  const parsedPubkey = parsePubkey(vote.pubkey);
  const parsedSig = parseSig(vote.sig);

  const eligibleTree = new MerkleTree(22, proposal.merkleLeaves, {
    hashFunction: mimcHasher,
  });
  const eligibleRoot = eligibleTree.getRoot();
  const selfAddress = ethers.utils.computeAddress(
    ethers.utils.arrayify(vote.pubkey)
  );
  const selfMimc = mimcHasher(BigInt(selfAddress));
  const selfIdx = proposal.merkleLeaves.findIndex((x) => x == selfMimc);
  const eligiblePathData = eligibleTree.path(selfIdx);

  const voterTree = new MerkleTree(22, [], { hashFunction: mimcHasher });
  for (const pastVoter in pastVoters) {
    const pastVoterMimc = mimcHasher(BigInt(pastVoter));
    const pastVoterIdx = proposal.merkleLeaves.findIndex(
      (x) => x == pastVoterMimc
    );
    voterTree.update(pastVoterIdx, pastVoterMimc);
  }
  voterTree.update(selfIdx, selfMimc);
  const voterPathData = voterTree.path(selfIdx);

  const res = {
    msghash,
    pubkey: parsedPubkey,
    r: parsedSig[0],
    s: parsedSig[1],
    eligiblePathElements: eligiblePathData.pathElements,
    voterPathElements: voterPathData.pathElements,
    pathIndices: eligiblePathData.pathIndices,
  };

  console.log("res", res);
}

async function processProposalOption(proposal, option) {
  console.log("proposal option", proposal, option);
  const req = await fetch(`http://localhost:3000/api/votes/${proposal.id}`);
  const allCurrentVotes = await req.json();
  const { pastProof, pastVoters } = getPastSnark(proposal, option);

  for (const voter in allCurrentVotes) {
    if (!(voter.address in pastVoters)) {
      processVote(proposal, option, voter, pastProof, pastVoters);
      return true;
    }
  }
  return false;
}

async function processAll() {
  const res = await fetch(`http://localhost:3000/api/proposal`);
  const proposals = await res.json();

  for (const proposal of proposals) {
    for (const option of proposal.options) {
      let didProcess = true;
      while (didProcess) {
        didProcess = await processProposalOption(proposal, option);
      }
    }
  }
}

processAll();
