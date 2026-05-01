import type { NextApiRequest, NextApiResponse } from 'next';

type HealthcheckResponse = {
  status: string;
  hasSmokeTestToken: boolean;
};

export default function handler(
  _: NextApiRequest,
  res: NextApiResponse<HealthcheckResponse>
): void {
  res.status(200).json({
    status: 'ok',
    hasSmokeTestToken: Boolean(process.env.SMOKE_TEST_TOKEN),
  });
}
