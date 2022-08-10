// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./Verifier.sol";
import "./LibMIMC.sol";
import {console} from "forge-std/console.sol";

contract Isokratia is Verifier {
    uint256 constant k1 = 4;
    uint256 constant k2 = 6;

    event ProposalCreated(address creator, uint256 proposalId, uint256 endBlock);
    event AggregateCreated(uint256 proposalId, uint256 option, uint256 voteCount);

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
        uint64[k1][] memory options,
        string[] memory optionText) public {
        proposals[proposalId].id = proposalId;
        proposals[proposalId].endBlock = endBlock;
        proposals[proposalId].eligibleRoot = eligibleRoot;
        for (uint256 i = 0; i < options.length; i++) {
            proposals[proposalId].options[optionText[i]] = options[i];
        }
        emit ProposalCreated(msg.sender, proposalId, endBlock);
    }

    function postAggregation(uint256 proposalId,
        string memory option,
        uint256 voteCount,
        uint256 voterRoot,
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[1] memory _input) public {
        require(block.number <= proposals[proposalId].endBlock, "Proposal has expired");
        require(verifyProof(_a, _b, _c, _input), "Bad proof");

        uint256[3 + k1 + 6 * 2 * k2 + 3 * 2 * 2 * k2] memory commitmentInputs;
        commitmentInputs[0] = voteCount;
        commitmentInputs[1] = proposals[proposalId].eligibleRoot;
        commitmentInputs[2] = voterRoot;
        uint256 hasherIdx = 3;
        for (uint256 i = 0;i < k1;i++) {
            commitmentInputs[hasherIdx] = proposals[proposalId].options[option][i];
            hasherIdx++;
        }

        for (uint256 i = 0;i < 6;i++) {
            for (uint256 j = 0;j < 2;j++) {
                for (uint256 idx = 0;idx < k2;idx++) {
                    commitmentInputs[hasherIdx] = negalfa1xbeta2[i][j][idx];
                    hasherIdx++;
                }
            }
        }

        for (uint256 i = 0;i < 2;i++) {
            for (uint256 j = 0;j < 2;j++) {
                for (uint256 idx = 0;idx < k2;idx++) {
                    commitmentInputs[hasherIdx] = gamma2[i][j][idx];
                    hasherIdx++;
                }
            }
        }
        
        for (uint256 i = 0;i < 2;i++) {
            for (uint256 j = 0;j < 2;j++) {
                for (uint256 idx = 0;idx < k2;idx++) {
                    commitmentInputs[hasherIdx] = delta2[i][j][idx];
                    hasherIdx++;
                }
            }
        }

        for (uint256 i = 0;i < 2;i++) {
            for (uint256 j = 0;j < 2;j++) {
                for (uint256 idx = 0;idx < k2;idx++) {
                    commitmentInputs[hasherIdx] = IC[i][j][idx];
                    hasherIdx++;
                }
            }
        }

        uint256 hash = uint256(sha256(abi.encode(commitmentInputs))) >> 6;
        console.log('hash: ', hash);
        require(_input[0] == hash, "Bad public commitment");

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
