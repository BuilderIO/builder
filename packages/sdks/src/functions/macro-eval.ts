/**
 * Compile time insert expressions. Useful with ifTarget, like:
 *   ifTarget('reactNative', () => macroEval`import 'foo'`)
 */
export function macroEval(items: TemplateStringsArray, string: string) {}
