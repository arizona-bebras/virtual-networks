import { userTagsFn } from "$pages/app/network/[slug]/tags/api/query";
import { queryClient } from "$shared/api/query-client";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ parent, params }) => {
  const networkId = params.slug;
  await queryClient.ensureQueryData({
    queryKey: ["userTags", networkId],
    queryFn: () => userTagsFn(networkId),
  });
};
