const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const RECEIVER = "0x15005E6e7f4aA7d5910fFd1E364c691E6b175eD4".toLowerCase();
const REQUIRED = ethers.utils.parseEther("0.01");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  try {
    // Manually parse body (required in Vercel)
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const rawBody = Buffer.concat(chunks).toString();
    const body = JSON.parse(rawBody);

    const userAddress = body.userAddress?.toLowerCase();
    if (!userAddress) {
      return res.status(400).json({ error: "Missing userAddress" });
    }

    const txs = await provider.getHistory(userAddress);

    const paid = txs.some(tx =>
      tx.to?.toLowerCase() === RECEIVER &&
      tx.value.gte(REQUIRED)
    );

    if (paid) {
      return res.status(200).json({ access: true, url: "https://whop.com" });
    } else {
      return res.status(200).json({ access: false });
    }

  } catch (err) {
    console.error("VERIFY BACKEND ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};




