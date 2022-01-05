import { initAuth0 } from '@auth0/nextjs-auth0'

export default initAuth0({
  secret: process.env.AUTH0_SECRET!,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.BASE_URL,
  routes: {
    callback: `/api/callback`,
  },
})
