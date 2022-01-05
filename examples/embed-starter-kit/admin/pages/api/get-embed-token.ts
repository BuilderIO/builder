import Cors from 'cors'
import initMiddleware from '../../helpers/init-middleware'
import generateEmbedToken from '../../helpers/generate-embed-token'

import type { NextApiRequest, NextApiResponse } from 'next'
import auth0 from 'helpers/auth0'

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET
    methods: ['GET'],
  })
)

export default async function spaces(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Run cors
  await cors(req, res)

  const session = await auth0.getSession(req, res)

  if (!session?.user) {
    return res.status(404).json({
      error: {
        message: 'Forbidden',
      },
    })
  }

  switch (req.method) {
    case 'GET':
      const rootPrivateKey = process.env.BUILDER_ROOT_PRIVATE_KEY
      // TODO check if current user has access to spaceID
      const { token, expires } = await generateEmbedToken(rootPrivateKey!, {
        spaceId: String(req.query.spaceId),
        domain: String(req.query.domain),
      })
      res.status(200).send({ token, expires })
      break
    case 'OPTIONS':
      // Get data from your database
      res.status(200).json({ ok: true })
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
