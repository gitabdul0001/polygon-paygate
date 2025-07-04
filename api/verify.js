const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const RECEIVER = "0x15005E6e7f4aA7d5910fFd1E364c691E6b175eD4".toLowerCase();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    let body = "";
    for await (const chunk of req) body += chunk;

    let data;
    try {
      data = JSON.parse(body);
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError, "Body was:", body);
      return res.status(400).json({ error: "Invalid JSON in request body" });
    }

    const { userAddress, txHash } = data;

    if (!userAddress || !txHash) {
      return res.status(400).json({ error: "Missing userAddress or txHash" });
    }

    // Sanity check addresses
    if (
      typeof userAddress !== "string" ||
      typeof txHash !== "string" ||
      !/^0x[a-fA-F0-9]{40}$/.test(userAddress) ||
      !/^0x[a-fA-F0-9]{64}$/.test(txHash)
    ) {
      return res.status(400).json({ error: "Invalid userAddress or txHash format" });
    }

    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return res.status(200).json({ access: false });
    }

    if (receipt.status !== 1) {
      return res.status(200).json({ access: false });
    }

    if (
      receipt.from.toLowerCase() !== userAddress.toLowerCase() ||
      receipt.to.toLowerCase() !== RECEIVER
    ) {
      return res.status(200).json({ access: false });
    }

    return res.status(200).json({ access: true, url: "https://whop.com" });
  } catch (error) {
    console.error("Verify API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};







