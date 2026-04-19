export type Device = {
  id: string;
  name: string;
  ip: string;
  status: "online" | "offline";
  tags: string[];
};
