import { PrismaClient } from "@prisma/client";
import MerkleTree from "fixed-merkle-tree";
import type { NextApiRequest, NextApiResponse } from "next";
import mimcHash from "../../lib/mimc";

const prisma = new PrismaClient();

type Proposal = {
  title: string;
  description: string;
  endBlock: string;
};

function hasher(x: string | number) {
  return mimcHash(123)(BigInt(x)).toString();
}

function hasher2(x: string | number, y: string | number) {
  return mimcHash(123)(BigInt(x), BigInt(y)).toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // Handle a GET request
    const address = req.query.address as string;
    const proposal_id = req.query.proposal_id as string;
    if (!address || !proposal_id) return;
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: Number(proposal_id),
      },
    });
    if (!proposal) return;
    const merkleLeafFromAddress = hasher(address);
    const inMerkleTree = await prisma.merkle.findFirst({
      where: {
        merkleRoot: proposal.merkleRoot,
        merkleLeaf: merkleLeafFromAddress,
      },
    });
    res.json({
      canVote: inMerkleTree ? true : false,
    });
  }
}
