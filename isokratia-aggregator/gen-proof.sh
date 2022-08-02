echo "$1"
cd circuit/dev_cpp
./dev ../../prover-input/"$1".json ../../prover-output/"$1".wtns
cd ..
/data/rapidsnark/build/prover dev.zkey ../prover-output/"$1".wtns ../prover-output/proof_"$1".json ../prover-output/public_"$1".json
