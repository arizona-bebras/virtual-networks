import { redirect } from "@sveltejs/kit";

export const load = () => {
  if (localStorage.getItem("token")) {
    throw redirect(302, "/app/dashboard");
  }
};
