import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useBlockNumber } from "wagmi";
import { Nav } from "../components/Nav";
import { ProposalStatus } from "../components/ProposalStatus";
import { Sidebar } from "../components/Sidebar";
import { baseURL } from "../lib/misc";
import styles from "../styles/Home.module.css";
import { Proposal } from "../types";

const Home: NextPage<{ proposals: Proposal[] }> = ({ proposals }) => {
  return (
    <div className="flex items-stretch min-h-full h-full w-full overflow-hidden">
      <Head>
        <title>isokratia</title>
        <meta
          name="description"
          content="isokratia is a trustless on-chain voting platform"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Sidebar />
      <div
        className="relative overflow-auto place-items-stretch flex flex-col flex-grow-1 w-full"
        style={{
          flexShrink: "initial",
          flexBasis: "initial",
        }}
      >
        <Nav title="Proposals" />
        <main className="flex flex-col items-center w-full w-max-160 px-4 mx-0 flex-auto relative">
          <div className="flex flex-col overflow-auto w-full">
            {[...proposals]
              .sort((a, b) => b.id - a.id)
              .map((proposal: Proposal, index: number) => {
                return (
                  <div key={index}>
                    <Link href={`/proposal/${proposal.id}`}>
                      <a className="p-3 flex items-center justify-between hover:text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">
                            {proposal.id}.{" "}
                          </span>
                          <span>{proposal.title}</span>
                        </div>
                        <ProposalStatus
                          blockNumber={Number(proposal.endBlock)}
                        />
                      </a>
                    </Link>
                    <div className="w-full bg-slate-300 h-px"></div>
                  </div>
                );
              })}
          </div>
        </main>
      </div>
    </div>
  );
};

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`${baseURL}/api/basic-proposal`);
  const proposals = await res.json();

  // Pass data to the page via props
  return { props: { proposals } };
}

export default Home;
