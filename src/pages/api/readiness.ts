import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const packageVersion = process.env.APP_VERSION ?? '';
  const release = process.env.NEXT_PUBLIC_SENTRY_RELEASE ?? '';

  res.status(200).json({
    status: 'ok',
    release,
    packageVersion,
  });
}
