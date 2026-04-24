import { redirect } from "@sveltejs/kit";
import { userData } from "$entities/user/model/store";
import { authClient } from "$shared/api/auth-client";

export const load = async () => {
  const { data } = await authClient.getSession();
  if (!data) {
    throw redirect(302, "/auth/login");
  }
  userData.current = data.user;
};
