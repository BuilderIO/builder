if (!process.env.BUILDER_PUBLIC_KEY) {
  throw new Error('Missing env varialbe BUILDER_PUBLIC_KEY')
}

export default {
  apiKey: process.env.BUILDER_PUBLIC_KEY,
}
