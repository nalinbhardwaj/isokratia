# Build
forge build
# Deploy
forge script script/Isokratia.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
# Verify
forge script script/Isokratia.s.sol --rpc-url $RPC_URL --private-key $PRIVATE_KEY --verify --etherscan-api-key $ETHERSCAN_API_KEY