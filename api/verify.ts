import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://polygon-rpc.com');
const RECEIVER = '0x15005E6e7f4aA7d5910fFd1E364c691E6b175eD4'.toLowerCase();
const REQUIRED = ethers.parseEther('0.01');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const userAddress = (req.body?.userAddress || '').toLowerCase();

    if (!userAddress) {
      return res.status(400).json({ error: 'Missing userAddress' });
    }

    const history = await provider.getHistory(userAddress);

    const paid = history.some(tx =>
      tx.to?.toLowerCase() === RECEIVER &&
      tx.value >= REQUIRED
    );

    if (paid) {
      return res.status(200).json({ access: true, url: 'https://whop.com' });
    } else {
      return res.status(200).json({ access: false });
    }

  } catch (error) {
    console.error('ERROR in verify:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}






