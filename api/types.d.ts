declare module '../dist/index.js' {
  const app: any;
  export default app;
}

declare module '*.js' {
  const content: any;
  export default content;
}
