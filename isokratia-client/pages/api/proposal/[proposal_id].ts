import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { useRouter } from "next/router";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const proposal = await prisma.proposal.findFirst({
      where: {
        id: Number(req.query.proposal_id),
      },
    });
    const optionRows = await prisma.proposalOptions.findMany({
      where: {
        proposal_id: Number(req.query.proposal_id),
      },
    });
    const options = optionRows.map((option) => option.option);

    const includeLeafs = req.query.includeLeafs === "true";

    if (includeLeafs) {
      const merkleLeafRows = await prisma.merkle.findMany({
        where: {
          merkleRoot: proposal!.merkleRoot,
        },
      });
      const merkleLeaves = merkleLeafRows.map((row: any) => row.merkleLeaf);
      res.json({ proposal, merkleLeaves, options: options });
    } else {
      res.json({ proposal, options: options });
    }
  }
}
