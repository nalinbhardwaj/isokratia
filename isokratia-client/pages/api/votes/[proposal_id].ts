import { PrismaClient } from "@prisma/client";
import * as secp from "@noble/secp256k1";
import keccak256 from "keccak256";
import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

const prisma = new PrismaClient();

type Vote = {
  address: string;
  pubkey: string;
  proposal_id: number;
  vote: string;
  sig: string;
};

// bigendian
function bigint_to_Uint8Array(x: bigint) {
  var ret = new Uint8Array(32);
  for (var idx = 31; idx >= 0; idx--) {
    ret[idx] = Number(x % 256n);
    x = x / 256n;
  }
  return ret;
}

// bigendian
function Uint8Array_to_bigint(x: Buffer) {
  var ret = 0n;
  for (var idx = 0; idx < x.length; idx++) {
    ret = ret * 256n;
    ret = ret + BigInt(x[idx]);
  }
  return ret;
}

async function createVote(vote: Vote) {
  const msg =
    "isokratia vote " + vote.vote + " for proposal " + vote.proposal_id;
  console.log("MESSSAGE: " + msg);

  // let prefix = "\x19Ethereum Signed Message:\n";
  // prefix += String(msg.length);

  // const prefixed = prefix.concat(msg);
  // console.log(prefixed);

  // const msghash_bigint = Uint8Array_to_bigint(keccak256(prefixed));
  // const msghash = bigint_to_Uint8Array(msghash_bigint);
  // // console.log("VOTE", vote);
  // console.log("SIG", vote.sig);
  // console.log("VOTE", vote);
  // console.log("HASH", msghash);
  // console.log("PUBKEY", vote.pubkey);

  // // if (!secp.verify(vote.sig, msghash, vote.pubkey)) {
  // //   console.log("nope");
  // //   return 400;
  // // }

  const address = ethers.utils.verifyMessage(msg, vote.sig);
  console.log("returned", address);
  if (address !== vote.address) {
    console.log("nope");
    return 400;
  }

  // check if already voted in prisma
  const existing = await prisma.vote.findFirst({
    where: {
      address: vote.address,
      proposal_id: vote.proposal_id,
    },
  });
  if (existing) {
    return 400;
  }

  console.log("creating vote...");
  await prisma.vote.create({
    data: {
      ...vote,
    },
  });

  console.log("done");

  return 200;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const bobody = req.body;
    const body = JSON.parse(bobody);
    const proposal_id = Number(body.proposal_id);
    const address = body.address as string;
    const pubkey = body.pubkey as string;
    const vote = body.vote as string;
    const sig = body.sig as string;
    console.log(proposal_id, address, pubkey, vote, sig);
    if (!proposal_id || !address || !pubkey || !vote || !sig) {
      console.log("missing fields");
      return res.status(400).send("missing parameters");
    }
    // Process a POST request
    console.log("Calling createVote()");
    const statusCode = await createVote({
      address,
      pubkey,
      proposal_id,
      vote,
      sig,
    });
    console.log("STATUSCODE", statusCode);
    res.status(statusCode);
  } else if (req.method === "GET") {
    // Handle a GET request
    const votes = await prisma.vote.findMany({
      where: {
        proposal_id: Number(req.query.proposal_id),
      },
    });
    res.json(votes);
  }
}
