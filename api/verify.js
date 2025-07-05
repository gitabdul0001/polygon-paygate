const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://devnet.uminetwork.com");
const usedTxHashes = new Set();

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    let body = "";
    for await (const chunk of req) body += chunk;

    const { userAddress, txHash, signature, receiver, minimumPayment } = JSON.parse(body);
    if (!userAddress || !txHash || !signature || !receiver)
      return res.status(400).json({ error: "Missing required fields" });

    // Use dynamic receiver and minimum payment
    const RECEIVER = receiver.toLowerCase();
    const MINIMUM_PAYMENT = minimumPayment ? ethers.BigNumber.from(minimumPayment) : ethers.utils.parseEther("0.01");

    // Signature verification
    const msg = "Verify address for paywall access";
    const recovered = ethers.utils.verifyMessage(msg, signature);
    if (recovered.toLowerCase() !== userAddress.toLowerCase())
      return res.status(401).json({ error: "Signature mismatch" });

    // Replay protection
    if (usedTxHashes.has(txHash))
      return res.status(200).json({ access: false, reason: "Replay detected" });

    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1)
      return res.status(200).json({ access: false, reason: "Tx failed or not confirmed" });

    if (
      receipt.from.toLowerCase() !== userAddress.toLowerCase() ||
      receipt.to.toLowerCase() !== RECEIVER
    ) {
      return res.status(200).json({ access: false, reason: "Sender/receiver mismatch" });
    }

    const tx = await provider.getTransaction(txHash);
    if (!tx.value || tx.value.lt(MINIMUM_PAYMENT)) {
      return res.status(200).json({ access: false, reason: "Payment below minimum" });
    }

    usedTxHashes.add(txHash);
    return res.status(200).json({ access: true, txHash: txHash });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};









