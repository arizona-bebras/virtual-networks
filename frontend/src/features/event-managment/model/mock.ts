// import type { Event } from "./event-table-columns";
import type { Event } from "common/schemas/event/index";
export const mockEvents: Event[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    user: {
      id: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
    },
    time: "2026-05-30T10:00:00Z",
    action: {
      type: "create",
    },
    entities: {
      type: "device",
      info: {
        id: "d1111111-1111-1111-1111-111111111111",
        name: "Alice's Phone",
        slug: "alice-phone",
        ip: "192.168.1.10",
        ownerId: "u1",
      },
    },
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    user: {
      id: "u2",
      name: "Bob Jones",
      email: "bob@example.com",
      role: "user",
    },
    action: {
      type: "update",
      updatedFields: [{ key: "port", old: "80", new: "443" }],
    },
    time: "2026-05-30T11:15:00Z",
    entities: {
      type: "rule",
      info: {
        id: "r1111111-1111-1111-1111-111111111111",
        sourceId: "t1111111-1111-1111-1111-111111111111",
        destId: "t2222222-2222-2222-2222-222222222222",
        description: "Allow web traffic",
        protocol: "TCP",
        port: 443,
      },
    },
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    user: {
      id: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
    },
    action: {
      type: "create",
    },
    time: "2026-05-30T12:30:00Z",
    entities: {
      type: "tag",
      info: {
        id: "t1111111-1111-1111-1111-111111111111",
        name: "Web Servers",
        color: "blue",
      },
    },
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    user: {
      id: "u3",
      name: "System",
      email: "system@example.com",
      role: "admin",
    },
    action: {
      type: "delete",
    },
    time: "2026-05-30T13:45:00Z",
    entities: {
      type: "device",
      info: {
        id: "d2222222-2222-2222-2222-222222222222",
        name: "Old Laptop",
        slug: "old-laptop",
        ip: "192.168.1.15",
        ownerId: "u2",
      },
    },
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    user: {
      id: "u2",
      name: "Bob Jones",
      email: "bob@example.com",
      role: "user",
    },
    action: {
      type: "delete",
    },
    time: "2026-05-30T14:20:00Z",
    entities: {
      type: "rule",
      info: {
        id: "r2222222-2222-2222-2222-222222222222",
        sourceId: null,
        destId: null,
        description: "Block all",
        protocol: "TCP",
        port: null,
      },
    },
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    user: {
      id: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
    },
    action: {
      type: "update",
      updatedFields: [
        { key: "name", old: "Prod Network", new: "Main Network" },
        {
          key: "description",
          old: "Production servers",
          new: "Main infrastructure",
        },
      ],
    },
    time: "2026-05-31T09:00:00Z",
    entities: {
      type: "network",
      info: {
        id: "n1111111-1111-1111-1111-111111111111",
        name: "Main Network",
        domain: "main-net",
        description: "Main infrastructure",
        cidr: "10.0.0.0/16",
        creatorId: "u1",
      },
    },
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    user: {
      id: "u2",
      name: "Bob Jones",
      email: "bob@example.com",
      role: "user",
    },
    action: {
      type: "update",
      updatedFields: [{ key: "ip", old: "192.168.1.10", new: "192.168.1.25" }],
    },
    time: "2026-05-31T10:30:00Z",
    entities: {
      type: "device",
      info: {
        id: "d1111111-1111-1111-1111-111111111111",
        name: "Alice's Phone",
        slug: "alice-phone",
        ip: "192.168.1.25",
        ownerId: "u1",
      },
    },
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    user: {
      id: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
    },
    action: {
      type: "update",
      updatedFields: [{ key: "color", old: "blue", new: "purple" }],
    },
    time: "2026-05-31T11:45:00Z",
    entities: {
      type: "tag",
      info: {
        id: "t1111111-1111-1111-1111-111111111111",
        name: "Web Servers",
        color: "purple",
      },
    },
  },
  {
    id: "99999999-9999-9999-9999-999999999999",
    user: {
      id: "u3",
      name: "System",
      email: "system@example.com",
      role: "admin",
    },
    action: {
      type: "update",
      updatedFields: [
        { key: "protocol", old: "TCP", new: "UDP" },
        { key: "port", old: "443", new: "53" },
      ],
    },
    time: "2026-05-31T14:10:00Z",
    entities: {
      type: "rule",
      info: {
        id: "r1111111-1111-1111-1111-111111111111",
        sourceId: "t1111111-1111-1111-1111-111111111111",
        destId: "t2222222-2222-2222-2222-222222222222",
        description: "Allow DNS traffic",
        protocol: "UDP",
        port: 53,
      },
    },
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    user: {
      id: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
    },
    action: {
      type: "update",
      updatedFields: [{ key: "domain", old: "main-net", new: "corp-net" }],
    },
    time: "2026-06-01T12:20:00Z",
    entities: {
      type: "network",
      info: {
        id: "n1111111-1111-1111-1111-111111111111",
        name: "Main Network",
        domain: "corp-net",
        description: "Main infrastructure",
        cidr: "10.0.0.0/16",
        creatorId: "u1",
      },
    },
  },
];
