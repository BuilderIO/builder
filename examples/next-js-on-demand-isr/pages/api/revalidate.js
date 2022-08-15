import Cors from 'cors'

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD', 'OPTIONS'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

/**
 * API to revalidate pages
 */
export default async (req, res) => {
  // Run the middleware
  await runMiddleware(req, res, cors)

  /**
     * 
     * type HookData = {
        operation: 'delete' | 'publish' | 'unpublish' | 'archive';
        modelName: string;
        newValue: BuilderContent
        previousValue: BuilderContent
    }
    */
  const hookData = req.body
  const urls = [hookData.newValue, hookData.previousValue]
    .map((content) => {
      return content?.query?.find(
        (attribute) => attribute.property === 'urlPath'
      )?.value
    })
    .filter(Boolean)

  if (urls.length > 0 && req.query.secret === process.env.REVALIDATE_SECRET) {
    // using Set to ensure uniqueness
    await Promise.all([...new Set(urls)].map((url) => res.revalidate(url)))
    return res.send({ revalidated: true })
  }
  res.send({ ok: true })
}
