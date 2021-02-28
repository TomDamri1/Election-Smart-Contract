import React, { useEffect, useState } from "react";
import Election from "./contracts/Election.json";
import getWeb3 from "./getWeb3";
import { Button, CircularProgress } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { Animation } from "@devexpress/dx-react-chart";
import "./App.css";
import Countdown from "react-countdown";
import {
  Chart,
  BarSeries,
  Title,
  ArgumentAxis,
  ValueAxis,
} from "@devexpress/dx-react-chart-material-ui";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [c1v, setC1v] = useState(0);
  const [c2v, setC2v] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [locked, setLocked] = useState(false);
  const voteFor = async (candidateId) => {
    try {
      try {
        await contract.methods.vote(candidateId).send({ from: accounts[0] });
      } catch (e) {
        let _locked;
        try {
          (async () => {
            _locked = await contract.methods.isContractLocked().call();
          })();
        } catch {}
        _locked
          ? alert("you cannot vote anymore, time is up")
          : alert("invalid vote!");
      }
    } catch (e) {}
  };

  useEffect(() => {
    const deployContract = async () => {
      try {
        const web3Instance = await getWeb3();
        const accountsInstance = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = Election.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          Election.abi,
          deployedNetwork && deployedNetwork.address
        );
        const _timeLeft = parseInt(
          await contractInstance.methods.secondsRemaining().call(),
          10
        );
        const _locked = await contractInstance.methods
          .isContractLocked()
          .call();
        console.log("timeleft:", _timeLeft, timeLeft, _locked, locked);
        const candidate1 = extractCandidate(
          await (await contractInstance.methods.candidates(1)).call()
        );
        const candidate2 = extractCandidate(
          await (await contractInstance.methods.candidates(2)).call()
        );
        console.log(candidate1, candidate2);

        setC1v(candidate1.votes);
        setC2v(candidate2.votes);
        setWeb3(web3Instance);
        setAccounts(accountsInstance);
        setContract(contractInstance);
        setTimeLeft(_timeLeft);
        setLocked(_locked);
      } catch (e) {
        alert(
          `Failed to load web3, accounts, or contract. Check console for details.`
        );
        console.error(e);
      }
    };
    deployContract();
  }, [locked, timeLeft]);
  try {
    return !web3 ? (
      <div className="App">
        <CircularProgress />
        <div>Loading Web3, accounts, and contract...</div>
      </div>
    ) : (
      <div className="App">
        <h1>Israeli Votes #33</h1>
        <h2>Via smart contract</h2>
        <h3> time left (approximately)</h3>
        <Countdown date={Date.now() + timeLeft * 1000} />,
        <p>
          Hello and welcome to the election #33! please vote for your candidate.
        </p>
        <Button
          variant="contained"
          color="primary"
          onClick={() => voteFor(1)}
          disabled={timeLeft === 0}
        >
          vote for bibi
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => voteFor(2)}
          disabled={timeLeft === 0}
        >
          vote for only-not-bibi
        </Button>
        <Paper style={{ width: 400 }}>
          <Chart
            data={[
              { candidate: "Bibi", votes: c1v },
              { candidate: "Not Bibi", votes: c2v },
            ]}
          >
            <ArgumentAxis />
            <ValueAxis max={7} />
            <BarSeries valueField="votes" argumentField="candidate" />
            <Title text={timeLeft !== 0 ? "Election status" : "Final Status!"} />
            <Animation />
          </Chart>
        </Paper>
      </div>
    );
  } catch (e) {}
};

export default App;

const extractCandidate = (candidate) => {
  return {
    id: parseInt(candidate[0], 10),
    name: candidate[1],
    votes: parseInt(candidate[2], 10),
  };
};
