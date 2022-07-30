import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import mimcHash from "../../lib/mimc";
import styles from "../../styles/Home.module.css";
import { Proposal, Vote } from "../types";

const ProposalPage: NextPage<{ proposals: Proposal[] }> = ({ proposals }) => {
  const router = useRouter();
  const proposalId = Number(router.query.id);
  const proposal = proposals.find((p) => p.id === proposalId)!;
  const [votes, setVotes] = useState<Vote[]>([]);
  const [canVote, setCanVote] = useState(false);
  const { data: account } = useAccount();
  const { signMessageAsync } = useSignMessage();

  function hasher(x: string | number) {
    return mimcHash(123)(BigInt(x)).toString();
  }
  console.log("proposal", proposal);

  useEffect(() => {
    const fetchVotes = async () => {
      const req = await fetch(`http://localhost:3000/api/votes/${proposalId}`);
      const res = await req.json();
      console.log("res here", res);
      setVotes(res);
      const tmpCanVote =
        account !== undefined &&
        account.address !== undefined &&
        proposal.merkleLeaves.includes(hasher(account.address));
      setCanVote(tmpCanVote);
    };

    fetchVotes();
  }, [proposalId]);

  const handleOptionClick = async (option: string) => {
    const message = "isokratia vote " + option + " for proposal " + proposalId;
    const data = await signMessageAsync({ message });
    console.log("data", data);

    const req = await fetch(`http://localhost:3000/api/vote`, {
      method: "POST",
      body: JSON.stringify({
        proposalId,
        option,
      }),
    });
    console.log("post", req.body);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>
          [{proposal.id}] {proposal.title}
        </title>
        <meta
          name="description"
          content={`[${proposal.id}] ${proposal.title} - ${proposal.description}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <nav className="font-sans flex flex-col text-center sm:flex-row sm:text-left sm:justify-between py-4 px-6 bg-white sm:items-baseline w-full">
        <div className="mb-2 sm:mb-0">
          <a
            href="/"
            className="text-2xl no-underline text-grey-darkest hover:text-blue-dark"
          >
            isokratia
          </a>
        </div>
        <ConnectButton chainStatus="none" />
      </nav>

      <main className={styles.main}>
        <h1 className={styles.title}>
          [{proposal.id}] {proposal.title}
        </h1>

        <p className={styles.description}>{proposal.description}</p>
        <p className={styles.description}>Current results</p>
        {proposal.options.map((option) => {
          return (
            <div className={styles.option}>
              <h2 className={styles.optionTitle}>
                {option} - {votes.filter((vote) => vote.vote == option).length}
              </h2>
            </div>
          );
        })}
        {canVote ? (
          <p className={styles.description}>Cast your vote</p>
        ) : (
          <p className={styles.description}>You're not eligible to vote</p>
        )}
        {canVote &&
          proposal.options.map((option) => {
            return (
              <button
                className="rounded-md bg-violet-200 w-10/12 h-10 m-2"
                onClick={() => handleOptionClick(option)}
              >
                Vote {option}
              </button>
            );
          })}
      </main>
    </div>
  );
};

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`http://localhost:3000/api/proposal`);
  const proposals = await res.json();

  // Pass data to the page via props
  return { props: { proposals } };
}

export default ProposalPage;
