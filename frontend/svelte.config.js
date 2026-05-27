import { relative, sep } from "node:path";
import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    // defaults to rune mode for the project, except for `node_modules`. Can be removed in svelte 6.
    runes: ({ filename }) => {
      const relativePath = relative(import.meta.dirname, filename);
      const pathSegments = relativePath.toLowerCase().split(sep);
      const isExternalLibrary = pathSegments.includes("node_modules");

      return isExternalLibrary ? undefined : true;
    },
  },
  kit: {
    adapter: adapter({
      fallback: "index.html",
    }),
    alias: {
      $entities: "src/entities",
      $features: "src/features",
      $pages: "src/pages",
      $shared: "src/shared",
      $widgets: "src/widgets",
    },
  },
  vitePlugin: {
    inspector: true,
  },
};

export default config;
