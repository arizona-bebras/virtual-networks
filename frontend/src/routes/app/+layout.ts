import { redirect } from "@sveltejs/kit";
import { authClient } from "$shared/api/auth-client";
import { userData } from "$entities/user/model/store";

export const load = async () => {
  const { data } = await authClient.getSession();
  if (!data) {
    throw redirect(302, "/auth/login");
  }
  userData.current = {
    name: data.user.name,
    id: data.user.id,
    email: data.user.email,
  }
};
