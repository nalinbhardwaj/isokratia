// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Verifier.sol";

contract Isokratia is Verifier {
    uint256 constant k1 = 4;
    uint256 constant k2 = 6;

    event ProposalCreated(address creator, uint256 proposalId, uint256 endBlock);
    event AggregateCreated(uint256 proposalId, string option, uint256 voteCount);

    ///////////////////// Errors////////////////////////

    error ALREADYEXISTS();
    error BAD_PROOF();
    error EXPIRED();
    error BADCOMMITMENT();

    struct Proposal {
        uint256 id;
        uint256 endBlock;
        uint256 eligibleRoot;
        mapping(string => uint64[k1]) options;
        mapping(string => uint256) voteCount;
    }

    mapping(uint256 => Proposal) proposals;
    uint256[6][2][6] negalfa1xbeta2;
    uint256[6][2][2] gamma2;
    uint256[6][2][2] delta2; 
    uint256[6][2][2] IC;

    function createProposal(uint256 proposalId,
        uint256 endBlock,
        uint256 eligibleRoot,
        uint64[k1][] calldata options,
        string[] calldata optionText) public {
        if (proposals[proposalId].id !=0) {
            revert ALREADYEXISTS();
        }
        proposals[proposalId].id = proposalId;
        proposals[proposalId].endBlock = endBlock;
        proposals[proposalId].eligibleRoot = eligibleRoot;
        uint length = options.length;
        uint256 i;
        for (; i <length; ) {
            proposals[proposalId].options[optionText[i]] = options[i];
            unchecked{
                ++i;
            }
        }
        emit ProposalCreated(msg.sender, proposalId, endBlock);
    }

    function postAggregation(uint256 proposalId,
        string calldata option,
        uint256 voteCount,
        uint256 voterRoot,
        uint256[2] calldata _a,
        uint256[2][2] calldata _b,
        uint256[2] calldata _c,
        uint256[1] calldata _input) public {
        if (block.number > proposals[proposalId].endBlock){
            revert EXPIRED();
        }
        if(!verifyProof(_a, _b, _c, _input)){
            revert BAD_PROOF();
        }

        uint256[3 + k1 + 6 * 2 * k2 + 3 * 2 * 2 * k2] memory commitmentInputs;
        commitmentInputs[0] = voteCount;
        commitmentInputs[1] = proposals[proposalId].eligibleRoot;
        commitmentInputs[2] = voterRoot;
        uint256 hasherIdx = 3;
        for (uint256 i ;i < k1;) {
            commitmentInputs[hasherIdx] = proposals[proposalId].options[option][i];
            hasherIdx++;
            unchecked{
                ++i;
            }
        }

        /// @dev Iterating the for loops 4 times  to prevent making 4 different loop functions 
        uint z ;
    while(z<=3){
        for (uint256 i ;i < 6;) {
            for (uint256 j ;j < 2;) {
                for (uint256 idx ;idx < k2;) {
                    if(hasherIdx <=79){
                    commitmentInputs[hasherIdx] = negalfa1xbeta2[i][j][idx];
                    hasherIdx++;
                    }
                    else if (hasherIdx <=151 ){
                        commitmentInputs[hasherIdx] = gamma2[i][j][idx];
                        hasherIdx++;
                    }
                    else if (hasherIdx <=223){
                         commitmentInputs[hasherIdx] = delta2[i][j][idx];
                         hasherIdx++;
                    }
                    else if (hasherIdx <=295){
                        commitmentInputs[hasherIdx] = IC[i][j][idx];
                        hasherIdx++;
                    }
                    unchecked{
                        ++idx;
                    }
                }
                unchecked{
                    ++j;
                }
            }
            unchecked{
                ++i;
            }
        }
    }

        uint256 hash = uint256(sha256(abi.encode(commitmentInputs))) >> 6;
        if (_input[0] != hash){
            revert BADCOMMITMENT();
        }

        if (voteCount > proposals[proposalId].voteCount[option]) {
            proposals[proposalId].voteCount[option] = voteCount;
            emit AggregateCreated(proposalId, option, voteCount);
        }
    }

    constructor(
        uint256[6][2][6] memory _negalfa1xbeta2,
        uint256[6][2][2] memory _gamma2,
        uint256[6][2][2] memory _delta2,
        uint256[6][2][2] memory _IC
        ) {
        negalfa1xbeta2 = _negalfa1xbeta2;
        gamma2 = _gamma2;
        delta2 = _delta2;
        IC = _IC;
    }
}
