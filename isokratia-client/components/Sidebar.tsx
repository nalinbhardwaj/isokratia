import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import IsokratiaLogo from "../assets/isokratia.svg";

export const Sidebar = () => {
  const router = useRouter();
  return (
    <nav className="relative w-1/4 box-border shrink-0 flex flex-col border-r-2 border-slate-100 z-10">
      <Link href="/">
        <Image
          src={IsokratiaLogo}
          alt="Isokratia, equality of power. Generated by OpenAI DALL-E."
        />
      </Link>

      <div
        style={{
          padding: "24px 24px 0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* <SidebarTitle onClick={() => previousPath ? history.push(previousPath): null}>{title}</SidebarTitle> */}
        <Link href="/">
          <span className="text-2xl no-underline text-grey-darkest font-semibold hover:text-blue-dark cursor-pointer hover:text-indigo-600">
            Isokratia: infinitely compressible governance using recursive SNARKs
          </span>
        </Link>
        <br />
        <span className="text-slate-600">
          Isokratia is an off-chain governance/polling platform that uses
          recursive SNARKs to compress votes and prove the results of the poll
          in a cheap on-chain transaction trustlessly.
        </span>
        <br />
        <a
          href="https://nibnalin.me/dust-nib/isokratia.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-slate-600 hover:text-blue-dark cursor-pointer hover:text-indigo-600">
            📝 Read more ↗️
          </span>
        </a>
        <a
          href="https://github.com/nalinbhardwaj/isokratia"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-slate-600 hover:text-blue-dark cursor-pointer hover:text-indigo-600">
            📙 Source code ↗️
          </span>
        </a>
        <a
          href="https://goerli.etherscan.io/address/0x8ff131B05aBE019b4Dc1cf29ABEc51083389b0B8"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="text-slate-600 hover:text-blue-dark cursor-pointer hover:text-indigo-600">
            📠 Testnet contract ↗️
          </span>
        </a>
      </div>
      {router.pathname !== "/proposal/new" && (
        <div className="overflow-y-auto px-4 py-4">
          <Link href={`/proposal/new`}>
            <button className="p-2 rounded bg-indigo-600 text-white flex w-full justify-center items-center drop-shadow-md">
              Create New Proposal
            </button>
          </Link>
        </div>
      )}
      <div
        style={{
          padding: "24px 24px 0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "24px",
        }}
      >
        <span className="text-slate-600">ἴσος / equal / κρατεῖν / to rule</span>
      </div>
    </nav>
  );
};
