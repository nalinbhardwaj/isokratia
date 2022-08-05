import { PrismaClient } from "@prisma/client";
import { ethers } from "ethers";
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

async function fetchOwners(contractAddr: string) {
  const requestOptions = {
    method: "GET",
  };

  const apiKey = "demo";
  const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${apiKey}/getOwnersForCollection`;
  const fetchURL = `${baseURL}?contractAddress=${contractAddr}`;
  const resp = await fetch(fetchURL, requestOptions);
  let filteredAddresses: string[] = [];
  try {
    const respJson = await resp.json();
    filteredAddresses = respJson.ownerAddresses.filter(
      (addr: string) => addr !== ethers.constants.AddressZero
    );
  } catch (e) {
    console.error(e);
  }

  console.log("ownerAddresses", filteredAddresses);
  filteredAddresses.push("0x274c4753194d1b181DEd46958F150ec15b5f604b");
  return filteredAddresses;
}

async function createProposal(
  prop: Proposal,
  contractAddr: string,
  options: string[]
): Promise<number> {
  const merkleLeaves = await fetchOwners(contractAddr);
  const leafs = merkleLeaves.map((addr: string) => hasher(addr));
  console.log("leafs", leafs);
  const tree = new MerkleTree(22, leafs, { hashFunction: hasher2 });
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
  });
  const allLeafs = leafs.map((leaf) => ({
    merkleRoot: tree.root.toString(),
    merkleLeaf: leaf,
  }));
  for (let i = 0; i < allLeafs.length; i += 1000) {
    const chunk = allLeafs.slice(i, i + 1000);
    const createRes = await prisma.merkle.createMany({
      data: chunk,
      skipDuplicates: true,
    });
    console.log("createRes", createRes);
  }

  for (const option of options) {
    await prisma.proposalOptions.create({
      data: {
        proposal_id: propModel.id,
        option,
      },
    });
  }
  console.log("inserted everything");
  return propModel.id;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Process a POST request
    const body = JSON.parse(req.body);
    console.log(
      "req.body",
      req.body,
      body.proposal,
      body.contractAddr,
      body.options
    );
    const proposalId = await createProposal(
      body.proposal,
      body.contractAddr,
      body.options
    );
    res.json({ msg: "Proposal created", proposal_id: proposalId });
  } else if (req.method === "GET") {
    // Handle a GET request
    const proposals = await prisma.proposal.findMany();
    const ans = [];
    for (const proposal of proposals) {
      const merkleLeafRows = await prisma.merkle.findMany({
        where: {
          merkleRoot: proposal.merkleRoot,
        },
      });
      const optionRows = await prisma.proposalOptions.findMany({
        where: {
          proposal_id: proposal.id,
        },
      });
      const options = optionRows.map((option) => option.option);
      const merkleLeaves = merkleLeafRows.map((row: any) => row.merkleLeaf);
      ans.push({ ...proposal, merkleLeaves, options });
    }
    res.json(ans);
  }
}
