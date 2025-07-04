const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const RECEIVER = "0x15005E6e7f4aA7d5910fFd1E364c691E6b175eD4".toLowerCase();
const REQUIRED_AMOUNT = ethers.utils.parseEther("0.01");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  try {
    let body = "";

    for await (const chunk of req) {
      body += chunk;
    }

    const data = JSON.parse(body);
    const userAddress = data.userAddress?.toLowerCase();

    if (!userAddress) {
      res.status(400).json({ error: "Missing userAddress" });
      return;
    }

    const history = await provider.getHistory(userAddress);

    const paid = history.some(tx =>
      tx.to?.toLowerCase() === RECEIVER &&
      tx.value.gte(REQUIRED_AMOUNT)
    );

    if (paid) {
      res.status(200).json({ access: true, url: "https://whop.com" });
    } else {
      res.status(200).json({ access: false });
    }
  } catch (error) {
    console.error("Verify API error:", error);
    res.status(500).json({ error: "Server error" });
  }
};






