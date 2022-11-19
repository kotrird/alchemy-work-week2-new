import abi from '../utils/BuyMeACoffee.json';
import { ethers } from "ethers";
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState } from "react";
import styles from '../styles/Home.module.css'

export default function Home() {
  // Contract Address & ABI
  const contractAddress = "0x3eD128D9da4D9A1c081D5d2b49559c444BEC3cAB";
  const contractABI = abi.abi;
  const contractOwner = "0x50B7c8ac1688d2e6CC062dA437Eaa2708DBE1AAf"

  // Component state
  const [currentAccount, setCurrentAccount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [name, setName] = useState("");
  const [newWithDrawAddr, setNewWithDrawAddr] = useState("");
  const [message, setMessage] = useState("");
  const [memos, setMemos] = useState([]);

  const onNewAddrChange = (event) => {
    setNewWithDrawAddr(event.target.value);
  }

  const onNameChange = (event) => {
    setName(event.target.value);
  }

  const onMessageChange = (event) => {
    setMessage(event.target.value);
  }

  // Wallet connection logic
  const isWalletConnected = async () => {
    try {
      const { ethereum } = window;

      const accounts = await ethereum.request({ method: 'eth_accounts' })
      console.log("accounts: ", accounts);

      if (accounts.length > 0) {
        const account = accounts[0];
        console.log("wallet is connected! " + account);
      } else {
        console.log("make sure MetaMask is connected");
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("please install MetaMask");
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      });

      setCurrentAccount(accounts[0]);
      setIsOwner(accounts[0] === contractOwner)
    } catch (error) {
      console.log(error);
    }
  }

  const buyCoffee = async (value) => {
    try {
      console.log('value===>', value)
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("buying coffee..")
        const coffeeTxn = await buyMeACoffee.buyCoffee(
          name ? name : "anon",
          message ? message : "Enjoy your coffee!",
          { value: ethers.utils.parseEther(value) }
        );

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("coffee purchased!");

        // Clear the form fields.
        setName("");
        setMessage("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateWithDrawAddr = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("updating withdraw addr...")
        const coffeeTxn = await buyMeACoffee.updateWithdrawAddress(newWithDrawAddr);

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("updating withdraw addr success");

        // Clear the form fields.
        setNewWithDrawAddr("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const withdraw = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("withdraw ing...")
        const coffeeTxn = await buyMeACoffee.withdrawTips();

        await coffeeTxn.wait();

        console.log("mined ", coffeeTxn.hash);

        console.log("withdraw success");

        // Clear the form fields.
        setNewWithDrawAddr("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function to fetch all memos stored on-chain.
  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const buyMeACoffee = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        console.log("fetching memos from the blockchain..");
        const memos = await buyMeACoffee.getMemos();
        console.log("fetched!");
        setMemos(memos);
      } else {
        console.log("Metamask is not connected");
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let buyMeACoffee;
    isWalletConnected();
    getMemos();

    // Create an event handler function for when someone sends
    // us a new memo.
    const onNewMemo = (from, timestamp, name, message) => {
      console.log("Memo received: ", from, timestamp, name, message);
      setMemos((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
          name
        }
      ]);
    };

    const { ethereum } = window;

    // Listen for new memo events.
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      buyMeACoffee = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      buyMeACoffee.on("NewMemo", onNewMemo);
    }

    return () => {
      if (buyMeACoffee) {
        buyMeACoffee.off("NewMemo", onNewMemo);
      }
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Buy komes#0704 a Coffee!</title>
        <meta name="description" content="Tipping site" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Buy komes#0704 a Coffee! ☕️
        </h1>

        {currentAccount ? (
          <div className="form-area">
            <form>
              <div>
                <label className="label-line">
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="fren"
                  onChange={onNameChange}
                />
              </div>
              <br />
              <div>
                <label className="label-line">
                  Send komes#0704 a message
                </label>
                <br/>

                <textarea
                  rows={3}
                  placeholder="Enjoy your coffee!"
                  id="message"
                  onChange={onMessageChange}
                  required
                >
                </textarea>
              </div>
              <div>
                <button
                  className="sm-btn"
                  type="button"
                  onClick={() => buyCoffee("0.001")}
                >
                  Send 1 Coffee for 0.001ETH
                </button>
              </div>
              <div>
                <button
                  className="sm-btn"
                  type="button"
                  onClick={() => buyCoffee("0.003")}
                >
                  Send 1 Large Coffee for 0.003ETH
                </button>
              </div>
            </form>

            {isOwner && <div>
              <input
                id="newAddr"
                type="text"
                placeholder="please input a new wallet address"
                onChange={onNewAddrChange}
              />
              <div>
                <button
                  className="sm-btn"
                  type="button"
                  onClick={updateWithDrawAddr}
                >
                  Update withdrawAddres
                </button>
              </div>
              <div>
                <button
                  className="sm-btn"
                  type="button"
                  onClick={withdraw}
                >
                  withdraw
                </button>
              </div>
            </div>}
          </div>
        ) : (
            <button onClick={connectWallet}> Connect your wallet </button>
          )}
      </main>

      {currentAccount && (<h1>Memos received</h1>)}

      {
        currentAccount && (memos.map((memo, idx) => {
          return (
            <div key={idx} style={{ border: "2px solid", "borderRadius": "5px", padding: "5px", margin: "5px" }}>
              <p style={{ "fontWeight": "bold" }}>"{memo.message}"</p>
              <p>From: {memo.name} at {memo.timestamp.toString()}</p>
            </div>
          )
        }))
      }

      <footer className={styles.footer}>
        <a
          href="https://alchemy.com/?a=roadtoweb3weektwo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created by @pasda_0078 as newbie in Web3 world!
        </a>
      </footer>
    </div>
  )
}
