echo "$1"
cd circuit/dev_cpp
./dev ../../prover-input/"$1".json ../../prover-output/"$1".wtns
cd ..
/data/rapidsnark/build/prover dev.zkey ../prover-output/"$1".wtns ../prover-output/"$1"-proof.json ../prover-output/"$1"-public.json
cd .. && cd python && source isokratia/bin/activate
python3 script.py "$1"-proof.json
cd ..
echo '[' > prover-output/"$1"-calldata.json
npx snarkjs zkesc prover-output/"$1"-public.json prover-output/"$1"-proof.json >> prover-output/"$1"-calldata.json
echo ']' >> prover-output/"$1"-calldata.json
