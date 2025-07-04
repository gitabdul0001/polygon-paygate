const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://devnet.uminetwork.com");
const RECEIVER = "0x4c3D7a355b1828957449AE562c56967a13565b9D".toLowerCase();

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    let body = "";
    for await (const chunk of req) body += chunk;

    const { userAddress, txHash } = JSON.parse(body);

    if (!userAddress || !txHash) {
      return res.status(400).json({ error: "Missing userAddress or txHash" });
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

    return res.status(200).json({ access: true, url: "https://whop.com" });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};








