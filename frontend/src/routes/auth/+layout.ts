// import { redirect } from "@sveltejs/kit";

// export const load = () => {
//   if (localStorage.getItem("token")) {
//     throw redirect(302, "/app/dashboard");
//   }
// };
import { redirect } from "@sveltejs/kit";
import { authClient } from "$shared/api/auth-client";

export const load = async () => {
  const { data } = await authClient.getSession();
  if (data) {
    throw redirect(302, "/app/dashboard");
  }
};
