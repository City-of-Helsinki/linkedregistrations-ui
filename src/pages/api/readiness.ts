import type { NextApiRequest, NextApiResponse } from 'next';

import getEnvValue from '../../utils/getEnvValue';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const packageVersion = process.env.APP_VERSION ?? '';
  const release = getEnvValue('NEXT_PUBLIC_SENTRY_RELEASE') ?? '';

  res.status(200).json({
    status: 'ok',
    release,
    packageVersion,
  });
}
