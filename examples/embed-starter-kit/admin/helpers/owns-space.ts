import auth0 from './auth0'
import { table } from './airtable'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function (
  spaceId: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await auth0.getSession(req, res)

  if (!session?.user) {
    return {
      forbidden: true,
    }
  }

  try {
    const space = await table.find(spaceId)
    if (!space || session.user.sub !== space.fields.userId) {
      return {
        notFound: true,
      }
    }
    return {
      space,
    }
  } catch (err) {
    return {
      error: err,
    }
  }
}
