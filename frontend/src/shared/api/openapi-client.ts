import createClient from "openapi-fetch";
import { PUBLIC_API_URL } from "$env/static/public";
import type { paths } from "./openapi-schema";

export const client = createClient<paths>({
  baseUrl: PUBLIC_API_URL,
  credentials: "include",
});
