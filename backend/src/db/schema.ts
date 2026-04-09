import { 
  integer,
  pgTable,
  varchar,
  text,
  jsonb,
  uuid,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { defineRelations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid(`id`).primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).unique().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const networks = pgTable('networks', {
  id: uuid(`id`).primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  ip: varchar({ length: 15 }).notNull(),
  subnet: integer().notNull(),
  config: text().notNull(),
  admin_id: uuid()
    .notNull()
    .references(() => users.id),
});

export const devices = pgTable('devices', {
  id: uuid(`id`).primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  ip: varchar({ length: 17 }).notNull().unique(),
  config: text().notNull(),
  network_id: uuid()
    .notNull()
    .references(() => networks.id),
});

export const tags = pgTable('tags', {
  id: uuid(`id`).primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull().unique(),
  rules: jsonb(),
  network_id: uuid()
    .notNull()
    .references(() => networks.id),
});

export const devicesTags = pgTable(
  "devices_tags",
  {
    device_id: uuid()
      .notNull()
      .references(() => devices.id),
    tag_id: uuid()
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.device_id, t.tag_id] })],
);

export const relations = defineRelations(
  { users, networks, devices, tags, devicesTags },
  (r) => ({
    users: {
      networks: r.many.networks(),
    },
    networks: {
      admin: r.one.users({
        from: r.networks.admin_id,
        to: r.users.id,
      }),
      devices: r.many.devices(),
      tags: r.many.tags(),
    },
    devices: {
      network: r.one.networks({
        from: r.devices.network_id,
        to: r.networks.id,
      }),
      tags: r.many.tags({
        from: r.devices.id.through(r.devicesTags.device_id),
        to: r.tags.id.through(r.devicesTags.tag_id),
      }),
    },
    tags: {
      network: r.one.networks({
        from: r.tags.network_id,
        to: r.networks.id,
      }),
      devices: r.many.devices(),
    },
  }),
);
