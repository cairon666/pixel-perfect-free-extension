/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_BROWSER_API_ENABLE_EXTENSION: "true" | "false" | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.css?inline" {
  const content: string;
  export default content;
}

// Standard CSS modules
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
} 
