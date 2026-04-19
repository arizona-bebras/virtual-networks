import type { Device } from "./types.js";

export const initialDevices: Device[] = [
  {
    id: "1",
    name: "MacBook Pro",
    ip: "10.0.0.2",
    status: "online",
    tags: ["IT", "Laptop"],
  },
  {
    id: "2",
    name: "Database Server",
    ip: "10.0.0.5",
    status: "online",
    tags: ["Servers", "Production"],
  },
  {
    id: "3",
    name: "Web Server 01",
    ip: "10.0.0.10",
    status: "online",
    tags: ["Servers", "Web"],
  },
  {
    id: "4",
    name: "Backup Server",
    ip: "10.0.0.20",
    status: "offline",
    tags: ["Servers", "Backup"],
  },
];
