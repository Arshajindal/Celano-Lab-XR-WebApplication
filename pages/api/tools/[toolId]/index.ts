import type { NextApiRequest, NextApiResponse } from 'next';
import { getToolById } from '@/db/queries';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toolId } = req.query;
  if (typeof toolId !== 'string') {
    return res.status(400).json({ error: 'Invalid toolId' });
  }

  const tool = await getToolById(toolId);
  if (!tool) {
    return res.status(404).json({ error: 'Tool not found' });
  }

  return res.status(200).json(tool);
}
