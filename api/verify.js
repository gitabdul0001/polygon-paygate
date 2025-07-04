const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://devnet.uminetwork.com");
const RECEIVER = "0x4c3D7a355b1828957449AE562c56967a13565b9D".toLowerCase();
const usedTxHashes = new Set(); // Used tx tracker (in-memory)

const MINIMUM_PAYMENT = ethers.utils.parseEther("0.01"); // Minimum 0.01 ETH

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

    // 1. Verify signature proves wallet ownership
    const message = "Verify address for paywall access";
    const recovered = ethers.utils.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== userAddress.toLowerCase()) {
      return res.status(401).json({ error: "Signature mismatch" });
    }

    // 2. Check replay protection
    if (usedTxHashes.has(txHash)) {
      return res.status(200).json({ access: false, reason: "Replay detected" });
    }

    // 3. Verify transaction receipt status
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      return res.status(200).json({ access: false, reason: "Tx failed or not confirmed" });
    }

    // 4. Verify the tx sender and recipient
    if (
      receipt.from.toLowerCase() !== userAddress.toLowerCase() ||
      receipt.to.toLowerCase() !== RECEIVER
    ) {
      return res.status(200).json({ access: false, reason: "Tx address mismatch" });
    }

    // 5. Verify minimum payment amount
    const tx = await provider.getTransaction(txHash);
    if (!tx.value || tx.value.lt(MINIMUM_PAYMENT)) {
      return res.status(200).json({ access: false, reason: "Payment too low" });
    }

    // Mark tx hash as used (replay protection)
    usedTxHashes.add(txHash);

    // Grant access
    return res.status(200).json({ access: true, url: "https://whop.com" });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};









