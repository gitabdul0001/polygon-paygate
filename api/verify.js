const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const RECEIVER = "0x15005E6e7f4aA7d5910fFd1E364c691E6b175eD4".toLowerCase();
const REQUIRED_AMOUNT = ethers.utils.parseEther("0.01");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST method is allowed." });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = JSON.parse(Buffer.concat(chunks).toString());
    const userAddress = body.userAddress?.toLowerCase();

    if (!userAddress) {
      return res.status(400).json({ error: "Missing userAddress" });
    }

    const history = await provider.getHistory(userAddress);
    const found = history.some(tx =>
      tx.to?.toLowerCase() === RECEIVER &&
      tx.value.gte(REQUIRED_AMOUNT)
    );

    if (found) {
      return res.status(200).json({ access: true, url: "https://whop.com" });
    } else {
      return res.status(200).json({ access: false });
    }

  } catch (error) {
    console.error("Backend verify error:", error);
    return res.status(500).json({ error: "Verification error" });
  }
};



