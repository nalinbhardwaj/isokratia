export type Proposal = {
  id: number;
  title: string;
  description: string;
  merkleRoot: string;
  endBlock: string;
  merkleLeaves: string[];
  options: string[];
};

export type Vote = {
  id: number;
  address: string;
  proposal_id: number;
  vote: string;
  sig: string;
  pubkey: string;
};
