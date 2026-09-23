import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    buckets: {
      projects: { access: "public_read" },
      essentials: { access: "public_read" },
    },
  },
});
