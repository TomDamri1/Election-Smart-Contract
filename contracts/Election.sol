pragma solidity ^0.5.16;

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    //store accoutnts that have voted
    mapping(address => bool) public voters;
    // we are saving the values :
    // {unit : Candidate}
    mapping(uint256 => Candidate) public candidates;
    // count the number of the candidates
    uint256 public candidatesCount;
    uint256 private start = now;
    uint256 private secondsAfter = 60 * 5;

    // constructor
    //the same name as the contruct ==> constructor
    constructor() public {
        addCandidate("candidate 1");
        addCandidate("candidate 2");
    }

    function isContractLocked() public returns (bool) {
        if (now >= start + secondsAfter * 1 seconds) {
            return true;
        }
        return false;
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function secondsRemaining() public view returns (uint256) {
        if ( (now - start) < 60) {
            return (60 * 1 seconds) - (now - start);
        } else {
            return 0;
        }
    }

    function vote(uint256 _candidateId) public {
        //require:
        //0. contract is not locked
        require(!isContractLocked());
        //1. the voter never voted before
        //      the voter is not in the voters mapping
        require(!voters[msg.sender]);
        //2. valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        //record that voter has voted
        //msg.sender -> a way to access the sender
        voters[msg.sender] = true;
        //update candidate vote count
        candidates[_candidateId].voteCount++;
    }
}
