# Running an aggregator node

This guide details how to set up an aggregator node for Isokratia. To run a node, you will need:

- A reasonably beefy AWS Machine: Our aggregator runs on an AWS r5.8xlarge instance with 32-core 3.1GHz, 256G RAM machine with 1T hard drive and 400G swap, although you can likely get away with much lower hard disk, swap and RAM.
- A wallet with GoerliETH: Since Isokratia runs on the Goerli testnet right now, you’ll need to be able to make transactions to it.

## Setup

Start by setting up the machine and clone this git repository to it.

Then, create empty subfolders “prover-input” and “prover-output” in the isokratia-aggregator folder.

Download the circuits folder from this [Google Drive link](https://drive.google.com/drive/folders/1P6SVqZcwCE-yPKb86n6DCVWlxUO5opga?usp=sharing) and place it into the “isokratia-aggregator” folder as well.

Now, install the python dependencies of the repo using `pip install -r python/requirements.txt` and the node dependencies using `npm install`.

Now, running `node index.js` starts the aggregation node. You can run this in the background and log it’s output to a file using `node index.js > log.out 2>&1 &`

Feel free to reach out if you have issues.
