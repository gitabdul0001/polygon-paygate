const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://devnet.uminetwork.com");
const RECEIVER = "0x4c3D7a355b1828957449AE562c56967a13565b9D".toLowerCase();
const usedTxHashes = new Set(); // store already-used transactions

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    let body = "";
    for await (const chunk of req) body += chunk;

    const { userAddress, txHash, signature } = JSON.parse(body);

    if (!userAddress || !txHash || !signature) {
      return res.status(400).json({ error: "Missing required data" });
    }

    // ✅ 1. Signature Verification
    const message = "Verify address for paywall access";
    const recovered = ethers.utils.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(401).json({ error: "Signature mismatch" });
    }

    // ✅ 2. Replay Protection
    if (usedTxHashes.has(txHash)) {
      return res.status(200).json({ access: false, reason: "Replay detected" });
    }

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      return res.status(200).json({ access: false, reason: "Tx failed or not confirmed" });
    }

    if (
      receipt.from.toLowerCase() !== userAddress.toLowerCase() ||
      receipt.to.toLowerCase() !== RECEIVER
    ) {
      return res.status(200).json({ access: false, reason: "Tx address mismatch" });
    }

    // ✅ mark this tx as used
    usedTxHashes.add(txHash);

    return res.status(200).json({ access: true, url: "https://whop.com" });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};









