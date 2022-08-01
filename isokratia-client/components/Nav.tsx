import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/router";

export const Nav = ({ title }: { title: string }) => {
  const router = useRouter();
  return (
    <nav className="flex justify-between items-center p-4">
      <span
        className={`font-medium ${
          router.pathname !== "/" && "hover:text-blue-500 cursor-pointer"
        }`}
        onClick={() => router.back()}
      >
        {router.pathname !== "/" && "← "}
        {title}
      </span>
      <ConnectButton
        chainStatus="none"
        showBalance={{ smallScreen: false, largeScreen: false }}
      />
    </nav>
  );
};
