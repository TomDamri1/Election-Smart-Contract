var Election = artifacts.require("./Election.sol");

// Election.deployed().then(function(i) {app = i;})

contract("Election", (accounts) => {
  let instance;
  beforeEach(async () => {
    instance = await Election.deployed();
  });
  it("initializes with two candidates", async () => {
    const count = await instance.candidatesCount();
    assert.equal(count, 2);
  });

  it("initializes the candidate with the correct values", async () => {
    const candidate1 = extractCandidate(await instance.candidates(1));
    const candidate2 = extractCandidate(await instance.candidates(2));

    const testCandidate1 = {
      id: 1,
      name: "candidate 1",
      votes: 0,
    };

    const testCandidate2 = {
      id: 2,
      name: "candidate 2",
      votes: 0,
    };
    assert.deepEqual(testCandidate1, candidate1);
    assert.deepEqual(testCandidate2, candidate2);
  });

  it("throws an exception for invalid candidate", async () => {
    const numberOfCandidates = await instance.candidatesCount();
    const genericVoter = accounts[1];
    try {
      await instance.vote(99, { from: genericVoter });
    } catch (e) {
      assert(
        e.message.includes("revert"),
        "error message must contain `revert`"
      );
    }
    for (let i = 0; i < numberOfCandidates; i++) {
      const candidate = extractCandidate(await instance.candidates(i));
      assert.equal(candidate.votes, 0);
    }
  });

  it("votes for a candidate only once", async () => {
    const candidateId = 1;
    const voted = await instance.vote(candidateId, { from: accounts[1] });
    assert(voted, "the voter was marked as voted");
    const candidate = extractCandidate(await instance.candidates(candidateId));
    assert.equal(candidate.votes, 1);
    try {
      const votedSecondTime = await instance.vote(candidateId, {
        from: accounts[1],
      });
      assert(votedSecondTime, "the voter was marked as voted");
    } catch (e) {
      assert(
        e.message.includes("revert"),
        "error message must contain `revert`"
      );
    }

    const candidateAfterSecondVote = extractCandidate(
      await instance.candidates(candidateId)
    );
    assert.equal(candidate.votes, 1);
  });

  it("throws an exception for double voting", async () => {
    const ourCandidate = 2;
    await instance.vote(ourCandidate, { from: accounts[4] });
    const candidate = extractCandidate(await instance.candidates(ourCandidate));

    let voteCount = candidate.votes;

    assert.equal(voteCount, 1, "accepts first vote");

    const arrayBeforeDoubleVoting = await saveVotesAsArray();

    try {
      await instance.vote(ourCandidate, { from: accounts[4] });
    } catch (e) {
      assert(
        e.message.includes("revert"),
        "error message must contain `revert`"
      );
    }
    const arrayAfterDoubleVoting = await saveVotesAsArray();
    assert.deepEqual(arrayAfterDoubleVoting, arrayBeforeDoubleVoting);
  });

  it("locks the contract after some time", async () => {
    const ourCandidate = 2;
    const someTime = 60;
    const extraSeconds = 1;
    await instance.vote(ourCandidate, { from: accounts[5] });

    const arrayBeforeDoubleVoting = await saveVotesAsArray();

    
    console.log("logging before");
    await new Promise((resolve) =>
      setTimeout(() => resolve(), (someTime + extraSeconds) * 1000)
    );
    console.log("logging after");
    try {
      await instance.vote(ourCandidate, { from: accounts[6] });
    } catch (e) {}

    const arrayAfterDoubleVoting = await saveVotesAsArray();
    assert.deepEqual(arrayAfterDoubleVoting, arrayBeforeDoubleVoting);
  });

  const saveVotesAsArray = async () => {
    var votesArray = [];
    const numberOfCandidates = await instance.candidatesCount();
    for (let i = 0; i < numberOfCandidates; i++) {
      const candidate = extractCandidate(await instance.candidates(i));
      votesArray.push(candidate.votes);
    }
    return votesArray;
  };
});

const extractCandidate = (candidate) => {
  return {
    id: candidate[0].toNumber(),
    name: candidate[1].toString(),
    votes: candidate[2].toNumber(),
  };
};
