/// <reference types="vite/client" />

declare module "*.css?inline" {
  const content: string;
  export default content;
}

// Standard CSS modules
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
} 