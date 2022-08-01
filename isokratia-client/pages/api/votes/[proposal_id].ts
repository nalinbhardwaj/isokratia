import { PrismaClient } from "@prisma/client";
import * as secp from "@noble/secp256k1";
import keccak256 from "keccak256";
import type { NextApiRequest, NextApiResponse } from "next";

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
  const msghash_bigint = Uint8Array_to_bigint(keccak256(msg));
  const msghash = bigint_to_Uint8Array(msghash_bigint);
  console.log("VOTE", vote);
  console.log("HASH", msghash);

  if (!secp.verify(vote.sig, msghash, vote.pubkey)) {
    console.log("nope");
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
  console.log(req);
  const proposal_id = Number(req.query.proposal_id);
  const address = req.body.address as string;
  const pubkey = req.body.pubkey as string;
  const vote = req.body.vote as string;
  const sig = req.body.sig as string;
  if (!proposal_id || !address || !pubkey || !vote || !sig) {
    res.status(400).send("missing parameters");
  }
  if (req.method === "POST") {
    // Process a POST request
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
        proposal_id: proposal_id,
      },
    });
    res.json(votes);
  }
}
