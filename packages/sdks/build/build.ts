export async function build() {
}

if (require.main === module) {
  build().catch(console.error)
}