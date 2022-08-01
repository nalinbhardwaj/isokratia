import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Nav } from "../../components/Nav";
import { ProposalStatus } from "../../components/ProposalStatus";
import { Sidebar } from "../../components/Sidebar";
import mimcHash from "../../lib/mimc";
import styles from "../../styles/Home.module.css";
import { Proposal, Vote } from "../types";

const getPublicKey = (signatureString: string, signText: string) => {
  const msgHash = ethers.utils.hashMessage(signText);
  const publicKey = ethers.utils.recoverPublicKey(
    msgHash,
    ethers.utils.arrayify(signatureString)
  );
  return publicKey;
};

const ProposalPage: NextPage<{
  proposal: Proposal;
  options: string[];
}> = ({ proposal, options }) => {
  const router = useRouter();
  const proposalId = Number(router.query.id);
  // const proposal = proposals.find((p) => p.id === proposalId)!;
  const [votes, setVotes] = useState<Vote[]>([]);
  const [canVote, setCanVote] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { data: account } = useAccount();
  const { signMessageAsync } = useSignMessage();

  function hasher(x: string | number) {
    return mimcHash(123)(BigInt(x)).toString();
  }
  // console.log("proposal", proposal);

  useEffect(() => {
    const fetchVotes = async () => {
      if (!account) return;
      const req = await fetch(`http://localhost:3000/api/votes/${proposalId}`, {
        method: "GET",
      });
      console.log(req);
      const res = await req.json();
      setVotes(res);
      const hasVoted =
        res.filter((vote: Vote) => {
          return vote.address === account.address;
        }).length > 0;
      setHasVoted(hasVoted);
      const canVote = await fetch(
        `http://localhost:3000/api/proposal-eligible?proposal_id=${proposalId}&address=${account.address}`,
        {
          method: "GET",
        }
      );
      const eligibilityCheck = await canVote.json();
      const tmpCanVote =
        account !== undefined &&
        account.address !== undefined &&
        eligibilityCheck.canVote &&
        !hasVoted;

      setCanVote(tmpCanVote);
    };

    fetchVotes();
  }, [proposalId]);

  const handleOptionClick = async (option: string) => {
    console.log("ACCOUNT", account);
    if (!account) return;
    const message = "isokratia vote " + option + " for proposal " + proposalId;
    console.log("message", message);
    const data = await signMessageAsync({ message });
    console.log("sig", data);

    const recoveredPubKey = getPublicKey(data, message);

    const req = await fetch(`http://localhost:3000/api/votes/${proposalId}`, {
      method: "POST",
      body: JSON.stringify({
        address: account.address,
        pubkey: recoveredPubKey,
        proposal_id: proposalId,
        vote: option,
        sig: data,
      }),
    });
    console.log("post", req.body);
  };

  return (
    <div className="flex items-stretch h-min-full h-full w-full overflow-hidden">
      <Head>
        <title>
          isokratia Proposal {proposal.id} - {proposal.title}
        </title>
        <meta
          name="description"
          content={`[${proposal.id}] ${proposal.title} - ${proposal.description}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Sidebar />
      <div className="relative overflow-auto place-items-stretch flex flex-col flex-grow-1 w-full">
        <Nav title={`Proposal ${proposal.id} `} />

        <main className="flex flex-col items-center w-full max-w-lg justify-center p-x-3 mx-auto my-0">
          <div className="justify-start w-full mb-6">
            <div className="flex items-center justify-between mb-5">
              <h1 className="font-semibold text-3xl">{proposal.title}</h1>
              <ProposalStatus blockNumber={Number(proposal.endBlock)} />
            </div>

            <span className="font-semibold justiyf-start w-full max-w-lg mb-5 text-slate-600 mt-5">
              Description
            </span>
            <p className="text-slate-700">{proposal.description}</p>
          </div>
          <p className="font-semibold justify-start w-full mb-5 text-slate-600">
            Current results
          </p>
          <div className="flex flex-col w-full items-center gap-y-4">
            {options.map((option) => {
              return (
                // <div className={styles.option}>
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <h2 className="capitalize">{option}</h2>
                    <span>
                      {votes.filter((vote) => vote.vote == option).length} votes
                    </span>
                  </div>
                  <div className="h-2 rounded bg-slate-300 w-full"></div>
                </div>
              );
            })}
          </div>
          {canVote ? (
            <p className="text-slate-400 mt-4 mb-2">Cast your vote</p>
          ) : hasVoted ? (
            <p className="text-slate-400 mt-4 mb-2">You have already voted.</p>
          ) : (
            <p className="text-slate-400 mt-4 mb-2">
              You're not eligible to vote.
            </p>
          )}
          {canVote &&
            options.map((option) => {
              return (
                <button
                  className="rounded-md border-2 border-indigo-600 text-indigo-600 m-1 p-2 w-full flex hover:bg-indigo-600 hover:text-white transition-all duration-200 ease-in-out capitalize"
                  onClick={async () => await handleOptionClick(option)}
                >
                  {option}
                </button>
              );
            })}
        </main>
      </div>
    </div>
  );
};

// This gets called on every request
export async function getServerSideProps(context: any) {
  // Fetch data from external API
  const proposalId = Number(context.query.id);
  const res = await fetch(`http://localhost:3000/api/proposal/${proposalId}`);
  console.log(res);
  const proposal = await res.json();
  console.log("PROPOSAL", proposal.options);

  // Pass data to the page via props
  return {
    props: { proposal: proposal.proposal, options: proposal.options },
  };
}

export default ProposalPage;
