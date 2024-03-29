import extractDomain from 'extract-domain';
import { AwsUploader } from 'services/AwsUploader';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { ManagedUpload } from 'aws-sdk/clients/s3';

import { appConfig } from 'config';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string>
): Promise<ManagedUpload.SendData | void> {
  if (req?.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const type = req.headers['content-type'];

  if (!type) {
    return res.status(400).send('BadRequest');
  }

  try {
    const { appDomain } = appConfig;

    const reqDomain = extractDomain(req.headers.host ?? '');

    if (!appDomain.endsWith(reqDomain)) {
      return res.status(403).send('Forbidden');
    }

    const { Location } = await AwsUploader.uploadToBucket(req, type);

    return res.status(200).json(Location);
  } catch (err) {
    return res
      .status(500)
      .send('An error occurred while uploading image to S3!');
  }
}
