import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllTools } from '@/db/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, vendor, tag, search } = req.query;

  const tools = await getAllTools({
    category: typeof category === 'string' ? category : undefined,
    vendor: typeof vendor === 'string' ? vendor : undefined,
    tag: typeof tag === 'string' ? tag : undefined,
    search: typeof search === 'string' ? search : undefined,
  });

  return res.status(200).json(tools);
}
