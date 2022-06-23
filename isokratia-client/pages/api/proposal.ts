import { PrismaClient } from '@prisma/client';
import MerkleTree from 'fixed-merkle-tree';
import type { NextApiRequest, NextApiResponse } from 'next'
import mimcHash from '../../lib/mimc';

const prisma = new PrismaClient()

type Proposal = {
    title: string,
    description: string,
    endBlock: string,
}

function hasher(x: string | number) {
    return mimcHash(123)(BigInt(x)).toString();
}

function hasher2(x: string | number, y: string | number) {
    return mimcHash(123)(BigInt(x), BigInt(y)).toString();
}

async function createProposal(prop: Proposal, merkleLeaves: string[], options: string[]) {
    const leafs = merkleLeaves.map((addr: string) => hasher(addr));
    console.log("leafs", leafs);
    const tree = new MerkleTree(5, leafs, { hashFunction: hasher2 });
    const randproof = tree.path(0);

    console.log("randproof", randproof);

    console.log("prop", prop);
    console.log("merkleLeaves", merkleLeaves);
    console.log("root", tree.root);
    const propModel = await prisma.proposal.create({
        data: {
            ...prop,
            merkleRoot: tree.root.toString(),
        },
    })
    for (const leaf of merkleLeaves) {
        await prisma.merkle.create({
            data: {
                merkleRoot: tree.root.toString(),
                merkleLeaf: leaf,
            },
        })
    }

    for (const option of options) {
        await prisma.proposalOptions.create({
            data: {
                proposal_id: propModel.id,
                option,
            },
        })
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Process a POST request
        createProposal(req.body.proposal, req.body.merkleLeaves, req.body.options);
        res.json({ msg: 'Proposal created' });
    } else if (req.method === 'GET') {
        // Handle a GET request
        const proposals = await prisma.proposal.findMany();
        const ans = [];
        for(const proposal of proposals) {
            const merkleLeafRows = await prisma.merkle.findMany({
                where: {
                    merkleRoot: proposal.merkleRoot,
                }
            });
            const optionRows = await prisma.proposalOptions.findMany({
                where: {
                    proposal_id: proposal.id,
                }
            });
            const options = optionRows.map((option) => option.option);
            const merkleLeaves = merkleLeafRows.map((row: any) => row.merkleLeaf);
            ans.push({...proposal, merkleLeaves, options});
        }
        res.json(ans);
    }
  }