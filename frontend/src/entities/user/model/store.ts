import { PersistedState } from "runed";
import type { authClient } from "$shared/api/auth-client";

type SessionData = {
    name: string;
    id: string;
    email: string;
    [key: string]: any;
}

export const userData = new PersistedState<SessionData | null>("user", null);