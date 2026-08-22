import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "../nextlift-backend/openapi.json",
    },
    output: {
      target: "src/api/generated/endpoints.ts",
      schemas: "src/api/generated/models",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      mode: "tags-split",
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        query: {
          useQuery: true,
        },
      },
    },
  },
});
