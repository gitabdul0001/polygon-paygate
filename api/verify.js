const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const TARGET = "0x15005E6e7f4aA7d5910fFd1E364c691E6b175eD4";
const REQUIRED = ethers.utils.parseEther("0.01");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { userAddress } = req.body;

    if (!userAddress) {
      return res.status(400).json({ error: "userAddress missing" });
    }

    const history = await provider.getHistory(userAddress);
    const paid = history.some(tx =>
      tx.to?.toLowerCase() === TARGET.toLowerCase() &&
      tx.value.gte(REQUIRED)
    );

    if (paid) {
      return res.status(200).json({ access: true, url: "https://whop.com" });
    } else {
      return res.status(200).json({ access: false });
    }

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ error: "Server error verifying payment" });
  }
};


