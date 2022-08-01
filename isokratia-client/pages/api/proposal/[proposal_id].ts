import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

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
    res.json({ proposal, options: options });
  }
}
