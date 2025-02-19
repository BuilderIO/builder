declare module 'rollup-plugin-serve' {
  interface ServeOptions {
    contentBase?: string
    port?: number
    headers?: Record<string, string>
  }

  export default function serve(options?: ServeOptions): any
} 