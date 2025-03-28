import type { NextApiRequest, NextApiResponse } from 'next';

import siteSettings from '../../../public/assets/siteSettings.json';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
) {
  res
    .setHeader('Content-Type', 'text/plain')
    .status(200)
    .send(JSON.stringify(siteSettings));
}
