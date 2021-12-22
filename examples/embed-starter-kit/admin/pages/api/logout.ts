import auth0 from '../../helpers/auth0'
import { HandlerError } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function logout(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await auth0.handleLogout(req, res)
  } catch (e) {
    if (e instanceof HandlerError) {
      res.status(e.status || 500).end(e.message)
    }
  }
}
