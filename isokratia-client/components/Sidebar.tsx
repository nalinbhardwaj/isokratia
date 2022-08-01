import Link from "next/link";
import { useRouter } from "next/router";

export const Sidebar = () => {
  const router = useRouter();
  return (
    <div className="relative w-1/4 box-border shrink-0 flex flex-col border-r-2 border-slate-100 z-10">
      <div
        style={{
          padding: "24px 24px 0 24px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* <SidebarTitle onClick={() => previousPath ? history.push(previousPath): null}>{title}</SidebarTitle> */}
        <a
          href="/"
          className="text-2xl no-underline text-grey-darkest font-semibold hover:text-blue-dark"
        >
          isokratia
        </a>
        <span className="text-slate-600">Some kind of long description.</span>
        <span className="text-slate-600">
          An a off-chain governance platform that can aggregate votes and put
          them on-chain. Simple yes/no proposals Considered “Passed” if
          count(yes) greater than count(no) and more than half the eligible
          voters voted, “Failed” otherwise 1 address = 1 vote Sybilable, but we
          ignore that for now for simplicity of not dealing with weights etc.
        </span>
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
    </div>
  );
};
