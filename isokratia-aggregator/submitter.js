import fs from "fs";
import { BigNumber, Contract, ethers, Wallet } from "ethers";

export async function submit(proposalId, option) {
  const RPC = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const isokratiaContractAddr = process.env.ISOKRATIA_CONTRACT_ADDR;

  console.log(RPC, privateKey, isokratiaContractAddr);

  const IsokratiaABIJSON = JSON.parse(fs.readFileSync("isokratia.abi.json"));

  console.log(`connecting to Ethereum JSON RPC ${RPC}`);
  const ethProvider = new ethers.providers.JsonRpcProvider(RPC);
  const contract = new Contract(isokratiaContractAddr, IsokratiaABIJSON, ethProvider);
  const ethWallet = new Wallet(privateKey, ethProvider);
  const contractWithSigner = contract.connect(ethWallet);

  const argData = JSON.parse(fs.readFileSync(`prover-output/${proposalId}-${option}-calldata.json`));
  const txOptions = { gasLimit: 25000000 };

  const tx = await contractWithSigner.functions["postAggregation"](
    ...argData,
    txOptions
  );
  
  while (true) {
    console.log(`Submitted ${tx.hash}, waiting for confirmation`);
    await sleep(1000);
    const receipt = await ethProvider.getTransactionReceipt(tx.hash);
    if (receipt == null) {
      console.log('Not yet confirmed');
      continue;
    }
    if (receipt.status === 1) {
      console.log('Transaction succeeded')
    } else {
      console.log('Transaction failed')
      console.log(receipt);
    }
    break;
  }
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

submit(35, "Yes");