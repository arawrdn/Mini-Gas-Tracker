import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createAppKit } from "@reown/appkit";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet } from "wagmi/chains";
import axios from "axios";

const wagmiAdapter = new WagmiAdapter({
  chains: [mainnet],
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID"
});

const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks: [mainnet]
});

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [alert, setAlert] = useState("");

  // Connect Wallet
  const connectWallet = async () => {
    const session = await modal.open();
    if (session.accounts && session.accounts.length > 0) {
      setAccount(session.accounts[0]);
    }
  };

  // Fetch ETH Balance
  const fetchBalance = async () => {
    if (!account) return;
    try {
      const response = await axios.get(
        `https://api.etherscan.io/api?module=account&action=balance&address=${account}&tag=latest&apikey=YOUR_ETHERSCAN_API_KEY`
      );
      setBalance((parseInt(response.data.result) / 1e18).toFixed(4));
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Gas Price
  const fetchGas = async () => {
    try {
      const response = await axios.get(
        "https://ethgasstation.info/api/ethgasAPI.json?api-key=YOUR_API_KEY"
      );
      const gas = response.data.fast / 10; // convert to gwei
      setGasPrice(gas);
      if (gas < 50) setAlert("⚠️ Gas price is low!");
      else setAlert("");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchGas();
    const interval = setInterval(fetchGas, 30000); // update gas every 30s
    return () => clearInterval(interval);
  }, [account]);

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h1>⛽ Mini Gas Tracker</h1>
      <p>Account: {account || "Not connected"}</p>
      <p>Balance: {balance} ETH</p>
      <p>Current Gas Price: {gasPrice} Gwei</p>
      {alert && <p style={{ color: "red" }}>{alert}</p>}
      <button
        onClick={connectWallet}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          borderRadius: "10px",
          background: "#4cafef",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "20px"
        }}
      >
        Connect Wallet
      </button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
