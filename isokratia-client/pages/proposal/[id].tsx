import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Home.module.css';
import { Proposal } from '../types';

const ProposalPage: NextPage<{proposals: Proposal[]}> = ({ proposals }) => {
  const router = useRouter();
  const proposalId = Number(router.query.id);
  const proposal = proposals.find(p => p.id === proposalId)!;

  return (
    <div className={styles.container}>
      <Head>
        <title>[{proposal.id}] {proposal.title}</title>
        <meta
          name="description"
          content={`[${proposal.id}] ${proposal.title} - ${proposal.description}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <ConnectButton chainStatus="none" />

        <h1 className={styles.title}>
          [{proposal.id}] {proposal.title}
        </h1>

        <p className={styles.description}>
          {proposal.description}
        </p>
      </main>

      <footer className={styles.footer}>
        Made with ❤️ by nibnalin
      </footer>
    </div>
  );
};

// This gets called on every request
export async function getServerSideProps() {
  // Fetch data from external API
  const res = await fetch(`http://localhost:3000/api/proposal`)
  const proposals = await res.json()

  // Pass data to the page via props
  return { props: { proposals } }
}


export default ProposalPage;
