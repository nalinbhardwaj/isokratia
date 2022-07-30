import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { Proposal } from "./types";

const Home: NextPage<{ proposals: Proposal[] }> = ({ proposals }) => {
  return (
    <div className={styles.container}>
      <Head>
        <title>isokratia</title>
        <meta
          name="description"
          content="isokratia is a trustless on-chain voting platform"
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
        <p className={styles.description}>ἴσος / equal / κρατεῖν / to rule</p>
        <p className={styles.description}>
          isokratia is a trustless on-chain voting platform
        </p>

        <div className={styles.grid}>
          {proposals.map((proposal: Proposal) => {
            return (
              <Link href={`/proposal/${proposal.id}`}>
                <a className={styles.card}>
                  <h2 className="font-bold">
                    [{proposal.id}] {proposal.title} &rarr;
                  </h2>
                  <p>{proposal.description}</p>
                </a>
              </Link>
            );
          })}
          <Link href={`/proposal/new`}>
            <a className={styles.card}>
              <h2 className="font-bold">Create new &rarr;</h2>
              <p>Create a new proposal for owners of an NFT collection!</p>
            </a>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>Made with ❤️ by nibnalin</footer>
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

export default Home;
