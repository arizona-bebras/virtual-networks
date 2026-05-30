// import type { Event } from "./event-table-columns";
import type { Event } from "common/schemas/event/index";
export const mockEvents: Event[] = [
  {
    id: "test-id-1",
    user: {
      id: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
    },
    event: "Device Added",
    time: "2026-05-30T10:00:00Z",
    action: "create",
    entities: {
      id: "d1",
      name: "Alice's Phone",
      slug: "alice-phone",
      ip: "192.168.1.10",
      ownerId: "u1",
    },
  },
  {
    id: "test-id-2",
    user: {
      id: "u2",
      name: "Bob Jones",
      email: "bob@example.com",
      role: "user",
    },
    event: "Rule Updated",
    action: "update",
    time: "2026-05-30T11:15:00Z",
    entities: {
      id: "r1",
      sourceId: "t1",
      destId: "t2",
      description: "Allow web traffic",
      protocol: "TCP",
      port: 80,
    },
  },
  {
    id: "test-id-3",
    user: {
      id: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
    },
    event: "Tag Created",
    action: "create",
    time: "2026-05-30T12:30:00Z",
    entities: {
      id: "t1",
      name: "Web Servers",
      color: "blue",
    },
  },
  {
    id: "test-id-4",
    user: {
      id: "u3",
      name: "System",
      email: "system@example.com",
      role: "admin",
    },
    event: "Device Removed",
    action: "create",
    time: "2026-05-30T13:45:00Z",
    entities: {
      id: "d2",
      name: "Old Laptop",
      slug: "old-laptop",
      ip: "192.168.1.15",
      ownerId: "u2",
    },
  },
  {
    id: "test-id-5",
    user: {
      id: "u2",
      name: "Bob Jones",
      email: "bob@example.com",
      role: "user",
    },
    event: "Rule Deleted",
    action: "delete",
    time: "2026-05-30T14:20:00Z",
    entities: {
      id: "r2",
      sourceId: null,
      destId: null,
      description: "Block all",
      protocol: null,
      port: null,
    },
  },
];
