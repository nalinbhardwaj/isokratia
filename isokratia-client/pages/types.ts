export type Proposal = {
    id: number;
    title: string;
    description: string;
    merkleRoot: string;
    endBlock: string;
    merkleLeaves: string[];
    options: string[];
}
