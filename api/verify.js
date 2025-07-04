const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const RECEIVER = "0x15005E6e7f4aA7d5910fFd1E364c691E6b175eD4".toLowerCase();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  try {
    let body = "";
    for await (const chunk of req) body += chunk;
    const { userAddress, txHash } = JSON.parse(body);

    if (!userAddress || !txHash) {
      res.status(400).json({ error: "Missing userAddress or txHash" });
      return;
    }

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt || receipt.status !== 1) {
      return res.status(200).json({ access: false });
    }

    if (
      receipt.from.toLowerCase() !== userAddress.toLowerCase() ||
      receipt.to.toLowerCase() !== RECEIVER
    ) {
      return res.status(200).json({ access: false });
    }

    res.status(200).json({ access: true, url: "https://whop.com" });
  } catch (error) {
    console.error("Verify API error:", error);
    res.status(500).json({ error: "Server error" });
  }
};







