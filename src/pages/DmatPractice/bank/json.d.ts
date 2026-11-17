/** The bank's files are plain JSON. `index.ts` is the one place that names them and gives them their types. */
declare module '*.json' {
  const value: unknown;
  export default value;
}
