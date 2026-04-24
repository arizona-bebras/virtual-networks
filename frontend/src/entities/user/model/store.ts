import { PersistedState } from "runed";
import type { authClient } from "$shared/api/auth-client";

// type SessionData = {
//   name: string;
//   id: string;
//   email: string;
//   // biome-ignore lint/suspicious/noExplicitAny: no types for better
//     [key: string]: any;
// };

export const userData = new PersistedState<
  typeof authClient.$Infer.Session.user | null
>("user", null);
