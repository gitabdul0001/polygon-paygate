const { ethers } = require("ethers");

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com");
const TARGET = "0x15005E6e7f4aA7d5910fFd1E364c691E6b175eD4";
const REQUIRED = ethers.utils.parseEther("0.01");

module.exports = async (req, res) => {
  const { userAddress } = req.body;

  try {
    const txs = await provider.getHistory(userAddress);
    const paid = txs.some(tx =>
      tx.to?.toLowerCase() === TARGET.toLowerCase() &&
      tx.value.gte(REQUIRED)
    );

    if (paid) {
      res.status(200).json({ access: true, url: "https://whop.com" });
    } else {
      res.status(200).json({ access: false });
    }
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
};

