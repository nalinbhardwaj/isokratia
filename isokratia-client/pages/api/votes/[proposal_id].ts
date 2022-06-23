import { PrismaClient } from '@prisma/client';
import * as secp from "@noble/secp256k1";
import keccak256 from 'keccak256';
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

type Vote = {
    address: string,
    pubkey: string,
    proposal_id: number,
    vote: string,
    sig: string,
}

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
    const msg = "isokratia vote " + vote.vote + " for proposal " + vote.proposal_id;
    const msghash_bigint = Uint8Array_to_bigint(keccak256(msg));
    const msghash = bigint_to_Uint8Array(msghash_bigint);

    if (!secp.verify(vote.sig, msghash, vote.pubkey)) {
        return 400;
    }

    await prisma.vote.create({
        data: {
            ...vote,
        },
    })

    return 200;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const proposal_id = Number(req.query.proposal_id);
    if (req.method === 'POST') {
        // Process a POST request
        const statusCode = await createVote({proposal_id, ...req.body});
        res.status(statusCode);
    } else if (req.method === 'GET') {
        // Handle a GET request
        const votes = await prisma.vote.findMany({
            where: {
                proposal_id: proposal_id,
            }
        });
        res.json(votes);
    }
  }