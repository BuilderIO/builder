import auth0 from '../../helpers/auth0'
import { HandlerError } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function callback(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await auth0.handleCallback(req, res)
    res.redirect('/')
  } catch (error) {
    console.error(error)
    if (error instanceof HandlerError) {
      res.status(error.status || 400).end(error.message)
    }
    res.status(500).send({ error: { message: 'Internal Error' } })
  }
}
