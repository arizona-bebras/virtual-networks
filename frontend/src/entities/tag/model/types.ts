export type Tag = {
  id: string;
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: Component typing in Svelte 5 can be complex with library components
  icon: any;
  color: string;
  count: number;
};
