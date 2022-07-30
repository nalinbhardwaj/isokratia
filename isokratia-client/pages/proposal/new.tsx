import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "../../styles/Home.module.css";
import { Proposal } from "../types";

const ProposalPage: NextPage<{}> = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [endBlock, setEndBlock] = useState("");
  const [options, setOptions] = useState('["yes", "no"]');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleEndBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndBlock(e.target.value);
  };

  const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(e.target.value);
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const handleContractAddressChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setContractAddress(e.target.value);
  };

  const handleCreateClick = async () => {
    console.log(title, description, contractAddress);
    const req = await fetch("http://localhost:3000/api/proposal", {
      method: "POST",
      body: JSON.stringify({
        proposal: {
          title,
          description,
          endBlock,
        },
        contractAddr: contractAddress,
        options: JSON.parse(options),
      }),
    });
    console.log("post", req.body);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create new proposal</title>
        <meta name="description" content={`Create new proposal`} />
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
        <h1 className={styles.title}>Create new proposal</h1>
        <div className="mb-6 w-10/12">
          <label className="block mb-2 text-sm font-medium">Title</label>
          <input
            type="text"
            id="large-input"
            className="block p-4 w-full rounded-lg border sm:text-md"
            value={title}
            onChange={handleTitleChange}
          />
        </div>

        <div className="mb-6 w-10/12">
          <label className="block mb-2 text-sm font-medium">End block</label>
          <input
            type="text"
            id="large-input"
            className="block p-4 w-full rounded-lg border sm:text-md"
            value={endBlock}
            onChange={handleEndBlockChange}
          />
        </div>

        <div className="mb-6 w-10/12">
          <label className="block mb-2 text-sm font-medium">Description</label>
          <textarea
            id="message"
            rows={4}
            className="block p-2.5 w-full text-sm rounded-lg border"
            placeholder="Your message..."
            value={description}
            onChange={handleDescriptionChange}
          ></textarea>
        </div>

        <div className="mb-6 w-10/12">
          <label className="block mb-2 text-sm font-medium">
            Contract Address
          </label>
          <input
            type="text"
            id="large-input"
            className="block p-4 w-full rounded-lg border sm:text-md"
            value={contractAddress}
            onChange={handleContractAddressChange}
          />
        </div>

        <div className="mb-6 w-10/12">
          <label className="block mb-2 text-sm font-medium">
            Options (JSON string)
          </label>
          <input
            type="text"
            id="large-input"
            className="block p-4 w-full rounded-lg border sm:text-md"
            value={options}
            onChange={handleOptionsChange}
          />
        </div>

        <button
          className="rounded-md bg-violet-200 w-10/12 h-10"
          onClick={handleCreateClick}
        >
          Create
        </button>
      </main>

      <footer className={styles.footer}>Made with ❤️ by nibnalin</footer>
    </div>
  );
};

export default ProposalPage;
