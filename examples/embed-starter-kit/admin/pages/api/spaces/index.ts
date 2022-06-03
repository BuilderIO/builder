import Cors from 'cors'
import initMiddleware from '../../../helpers/init-middleware'
import createNewSpace from '../../../helpers/create-new-space'
import addNewModel from '../../../helpers/add-new-model'
import type { NextApiRequest, NextApiResponse } from 'next'
import auth0 from 'helpers/auth0'
import { table, minifyRecords } from 'helpers/airtable'
import configureSSO from 'helpers/configure-sso'

// Initialize the cors middleware
const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    // Only allow requests with GET, POST and OPTIONS
    methods: ['POST', 'OPTIONS', 'GET'],
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
      const spaces = await table
        .select({ filterByFormula: `userId = '${session.user.sub}'` })
        .firstPage()

      res.status(200).json({
        ok: true,
        data: {
          spaces: minifyRecords(spaces),
        },
      })
      break
    case 'OPTIONS':
      // Get data from your database
      res.status(200).json({ ok: true })
      break
    case 'POST':
      // Create a new space
      const rootPrivateKey = process.env.BUILDER_ROOT_PRIVATE_KEY
      const { storeId, storeName, storeConfig } = JSON.parse(req.body)
      const { publicKey: spacePublicKey, privateKey: spacePrivateKey } =
        await createNewSpace(rootPrivateKey!, {
          storeId,
          storeConfig,
          storeName,
        })
      const themeModel = await addNewModel(spacePrivateKey.key, 'theme')
      const pageModel = await addNewModel(spacePrivateKey.key, 'page')
      const headerModel = await addNewModel(spacePrivateKey.key, 'header')
      // TODO:
      // 1. create an application on your auth0 tenant with domain level connection enabled
      // 2. get that application info and pass it to your newly created space in the following command
      // 3. add a new rule to only allow your store users from your system access to that application
      await configureSSO(spacePrivateKey.key, {
        // sharing the same client for a quick pass, this should be a new client, to be able to restrict access to it using auth0 rules
        clientId: process.env.AUTH0_CLIENT_ID!,
        issuer: process.env.AUTH0_ISSUER_BASE_URL!,
      })
      const record = {
        spacePublicKey,
        spacePrivateKey: spacePrivateKey.key,
        pageModelId: pageModel.id!,
        themeModelId: themeModel.id!,
        headerModelId: headerModel.id!,
        // organization
        userId: session.user.sub,
      }

      await table.create([{ fields: record }], { typecast: true })

      res.status(200).json({
        ok: true,
        data: record,
      })
      break
    default:
      res.setHeader('Allow', ['POST', 'OPTIONS'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
