import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useAccount, useBlockNumber } from "wagmi";
import { Loading } from "../../components/Loading";
import { Nav } from "../../components/Nav";
import { Sidebar } from "../../components/Sidebar";
import styles from "../../styles/Home.module.css";
import { Proposal } from "../../types";

const ProposalPage: NextPage<{}> = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [endBlock, setEndBlock] = useState("");
  const [options, setOptions] = useState<string[]>(["Yes", "No"]);
  const [canCreateProposal, setCanCreateProposal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [newOption, setNewOption] = useState<string>("");
  const { data: account } = useAccount();
  const { data: currentBlock } = useBlockNumber();

  const router = useRouter();

  useEffect(() => {
    if (!account) {
      setCanCreateProposal(false);
    } else {
      setCanCreateProposal(true);
    }
  }, [account]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleEndBlockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndBlock(e.target.value);
  };

  const handlePopulateEndBlock = () => {
    if (!currentBlock) return;
    setEndBlock(currentBlock.toString());
  };

  const handleNewOption = () => {
    const optionIsDuplicate = options.includes(newOption);
    if (newOption.length > 0 && !optionIsDuplicate) {
      setOptions([...options, newOption]);
      setNewOption("");
    }
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
    setLoading(true);
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
        // options: JSON.parse(options),
        options: options,
      }),
    });
    if (req.status === 200) {
      const res = await req.json();
      setLoading(false);
      router.push("/proposal/[id]", `/proposal/${res.proposal_id}`);
    }
    console.log("post", req.body);
  };

  return (
    <div className="flex items-stretch h-min-full h-full w-full overflow-hidden">
      <Head>
        <title>Create new proposal</title>
        <meta name="description" content={`Create new proposal`} />
      </Head>

      <Sidebar />
      <div className="relative overflow-auto place-items-stretch flex flex-col flex-grow-1 w-full">
        <Nav title="Create New Proposal" />
        {/* <main className={styles.main}> */}
        <main className="flex flex-col items-center w-full w-max-160 p-x-3 mx-0">
          <div className="mb-6 w-10/12">
            <label className="block mb-2 text-sm font-medium">Title</label>
            <input
              type="text"
              id="large-input"
              className="block p-4 w-full rounded-lg border sm:text-md"
              value={title}
              onChange={handleTitleChange}
              placeholder="Proposal title"
            />
          </div>

          <div className="mb-6 w-10/12">
            <label className="block mb-2 text-sm font-medium">
              Description
            </label>
            <textarea
              id="message"
              rows={4}
              className="block p-2.5 w-full text-sm rounded-lg border"
              placeholder="A description of this proposal..."
              value={description}
              onChange={handleDescriptionChange}
            ></textarea>
          </div>

          <div className="mb-6 w-10/12">
            <label className="block mb-2 text-sm font-medium">End block</label>
            <div className="flex items-center gap-x-2 relative mt-2">
              <input
                type="number"
                id="large-input"
                className="p-2 w-full rounded-lg border sm:text-md flex flex-1"
                value={endBlock}
                onChange={handleEndBlockChange}
                placeholder="12345678"
              />
              <button
                className="bg-blue-400 text-white font-medium p-2 rounded hover:bg-blue-500 transition:all duration-200 ease-in-out"
                onClick={handlePopulateEndBlock}
              >
                Latest block
              </button>
            </div>
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
              placeholder="0x..."
            />
          </div>

          <div className="mb-6 w-10/12">
            <label className="block mb-2 text-sm font-medium">Options</label>
            <div className="flex flex-col gap-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="p-4 rounded bg-slate-100 flex items-center justify-between"
                >
                  <span>{option}</span>
                  <div
                    className="cursor-pointer flex items-center justify-center p-1 rounded hover:bg-slate-300 transition-all duration-200 ease-in-out"
                    onClick={() => {
                      setOptions(options.filter((_, i) => i !== index));
                    }}
                  >
                    <DeleteButton />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-x-2 relative mt-2">
              <input
                type="text"
                id="large-input"
                className="p-2 w-full rounded-lg border sm:text-md flex flex-1"
                placeholder="Maybe"
                value={newOption}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setNewOption(e.target.value);
                }}
              />
              <button
                className="bg-slate-800 text-white font-medium p-2 rounded"
                onClick={handleNewOption}
              >
                Add option
              </button>
            </div>

            <button
              className="rounded bg-indigo-600 p-4 w-full text-white mt-3 disabled:opacity-60 disabled:cursor-not-allowed items-center"
              onClick={handleCreateClick}
              disabled={!canCreateProposal}
            >
              {loading && <Loading />}
              {canCreateProposal ? "Create Proposal" : "Connect wallet"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

const DeleteButton = () => {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

export default ProposalPage;
