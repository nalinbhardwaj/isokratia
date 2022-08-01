import { useBlockNumber } from "wagmi";

export const ProposalStatus = ({ blockNumber }: { blockNumber: number }) => {
  const { data: currentBlockNumber } = useBlockNumber();
  return (
    <div
      className={`border rounded px-2 ${
        currentBlockNumber && currentBlockNumber < blockNumber
          ? "border-emerald-500"
          : "border-slate-400"
      }`}
    >
      <span
        className={`uppercase text-sm ${
          currentBlockNumber && currentBlockNumber < blockNumber
            ? "text-emerald-500"
            : "text-slate-400"
        }`}
      >
        {currentBlockNumber && currentBlockNumber < blockNumber
          ? "Active"
          : "Expired"}
      </span>
    </div>
  );
};
