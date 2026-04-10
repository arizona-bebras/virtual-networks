export type EdgeData = ClientToSwitchData | SwitchToServerData;
export type ClientToSwitchData = {
  connectionType: "client-switch";
  speed: number;
};

export type SwitchToServerData = {
  connectionType: "switch-server";
  status: string;
};
