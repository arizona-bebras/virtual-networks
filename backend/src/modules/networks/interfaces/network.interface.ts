export interface Network {
  name: string;
  description: string;
  ip: string;
  subnet: number;
  config: string;
  admin_id: string;
}

export interface Device {
  name: string;
  ip: string;
  config: string;
  network_id: string;
}

export interface Tag {
  name: string;
  rules: string;
  network_id: string;
}
