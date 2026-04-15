import { defineRelations } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { delayWhen } from "rxjs";

export const users = pgTable("users", {
  id: uuid(`id`).primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).unique().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const networks = pgTable("networks", {
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

export const devices = pgTable("devices", {
  id: uuid(`id`).primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  ip: varchar({ length: 17 }).notNull().unique(),
  config: text().notNull(),
  network_id: uuid()
    .notNull()
    .references(() => networks.id),
});

export const tags = pgTable("tags", {
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

export const rules = pgTable("rules", {
  id: uuid(`id`).primaryKey().defaultRandom(),
  source: uuid().notNull().references(() => tags.id),
  dest: uuid().notNull().references(() => tags.id),
  protocol: varchar({ length: 32 }).notNull(),
  port: integer().notNull(),
  network_id: uuid()
    .notNull()
    .references(() => networks.id),
});

export const relations = defineRelations(
  { users, networks, devices, tags, devicesTags, rules },
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
      rules: r.many.rules(),
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
      source_rules: r.many.rules({
        from: r.tags.id,
        to: r.rules.source,
      }),
      dest_rules: r.many.rules({
        from: r.tags.id,
        to: r.rules.dest,
      }),
    },
    rules : {
      network: r.one.networks({
        from: r.rules.network_id,
        to: r.networks.id,
      }),
      source_tag: r.one.tags({
        from: r.rules.source,
        to: r.tags.id,
      }),
      dest_tag: r.one.tags({
        from: r.rules.dest,
        to: r.tags.id,
      }),
    },

  }),
);
