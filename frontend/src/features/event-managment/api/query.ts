import { queryOptions } from "@tanstack/svelte-query";
import { EventSchema } from "common/schemas/event/index";
import { z } from "zod";
import { PUBLIC_API_URL } from "$env/static/public";
import { queryKeys } from "$shared/api/query-keys";

const eventActionSchema = z.enum(["create", "update", "delete"]);
const eventEntitySchema = z.enum(["network", "device", "tag", "rule"]);
const eventsResponseSchema = z.array(EventSchema);

const eventFiltersSchema = z.object({
  networkId: z.string().min(1),
  userId: z.string().optional(),
  action: eventActionSchema.optional(),
  entity: eventEntitySchema.optional(),
  eventEarliestDate: z.string().optional(),
  eventLatestDate: z.string().optional(),
});

export type EventFilters = z.infer<typeof eventFiltersSchema>;

const appendIfPresent = (
  params: URLSearchParams,
  key: string,
  value: string | undefined,
) => {
  if (value) {
    params.set(key, value);
  }
};

const getEvents = async (filters: EventFilters) => {
  const parsedFilters = eventFiltersSchema.parse(filters);
  const url = new URL(
    `/networks/${encodeURIComponent(parsedFilters.networkId)}/events`,
    PUBLIC_API_URL,
  );

  appendIfPresent(url.searchParams, "user_id", parsedFilters.userId);
  appendIfPresent(url.searchParams, "action", parsedFilters.action);
  appendIfPresent(url.searchParams, "entity", parsedFilters.entity);
  appendIfPresent(
    url.searchParams,
    "event_earliest_date",
    parsedFilters.eventEarliestDate,
  );
  appendIfPresent(
    url.searchParams,
    "event_latest_date",
    parsedFilters.eventLatestDate,
  );

  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.status}`);
  }

  return eventsResponseSchema.parse(await response.json());
};

export const eventQuery = {
  networkEvents: (filters: EventFilters) =>
    queryOptions({
      queryKey: queryKeys.networkEventsList(filters.networkId, {
        userId: filters.userId,
        action: filters.action,
        entity: filters.entity,
        eventEarliestDate: filters.eventEarliestDate,
        eventLatestDate: filters.eventLatestDate,
      }),
      queryFn: () => getEvents(filters),
    }),
};
