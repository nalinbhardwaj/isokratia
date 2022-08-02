import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useBlockNumber } from "wagmi";
import { Nav } from "../components/Nav";
import { ProposalStatus } from "../components/ProposalStatus";
import { Sidebar } from "../components/Sidebar";
import styles from "../styles/Home.module.css";
import { Proposal } from "../types";

const Home: NextPage<{ proposals: Proposal[] }> = ({ proposals }) => {
  const { data: currentBlockNumber, isLoading } = useBlockNumber();
  return (
    // <div className={styles.container}>
    <div className="flex items-stretch h-min-full h-full w-full">
      <Head>
        <title>isokratia</title>
        <meta
          name="description"
          content="isokratia is a trustless on-chain voting platform"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar />
      <div className="relative overflow-y-auto place-items-stretch flex flex-col flex-grow-1 w-full">
        <Nav title="Proposals" />

        <main className="flex flex-col items-center w-full w-max-160 px-4 mx-0">
          {/* <p className={styles.description}>ἴσος / equal / κρατεῖν / to rule</p>
          <p className={styles.description}>
            isokratia is a trustless on-chain voting platform
          </p> */}
          <div className="flex flex-col overflow-auto w-full">
            {[...proposals]
              .sort((a, b) => b.id - a.id)
              .map((proposal: Proposal, index: number) => {
                return (
                  <div key={index}>
                    <Link href={`/proposal/${proposal.id}`}>
                      {/* <a className={styles.card}> */}
                      <a className="p-3 flex items-center justify-between hover:text-slate-600">
                        {/* <h2 className="font-bold">
                      [{proposal.id}] {proposal.title} &rarr;
                    </h2> */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">
                            {proposal.id}.{" "}
                          </span>
                          <span>{proposal.title}</span>
                        </div>
                        <ProposalStatus
                          blockNumber={Number(proposal.endBlock)}
                        />
                        {/* <p>{proposal.description}</p> */}
                      </a>
                    </Link>
                    <div className="w-full bg-slate-300 h-px"></div>
                  </div>
                );
              })}
          </div>
        </main>

        {/* <footer className={styles.footer}>Made with ❤️ by nibnalin</footer> */}
      </div>
    </div>
  );
};

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`http://localhost:3000/api/basic-proposal`);
  const proposals = await res.json();

  // Pass data to the page via props
  return { props: { proposals } };
}

export default Home;
