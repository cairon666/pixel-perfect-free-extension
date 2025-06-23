/// <reference types="vite/client" />

// Declare module for CSS files imported with ?inline suffix
declare module "*.css?inline" {
  const content: string;
  export default content;
}

// Standard CSS modules
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
} 