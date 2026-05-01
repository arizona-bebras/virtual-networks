import { defineRelations } from "drizzle-orm";
import {
  boolean,
  cidr,
  index,
  inet,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Better Auth Tables

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
  expiresAt: timestamp("expires_at"),
});

// App Tables

export const networks = pgTable("networks", {
  id: uuid(`id`).primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }).notNull(),
  cidr: cidr().default("192.168.123.0/24").notNull(),
  creatorId: text(`creator_id`).references(() => user.id, {
    onDelete: "no action",
  }),
});

export const devices = pgTable("devices", {
  id: uuid(`id`).primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  ip: inet().notNull(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  networkId: uuid("network_id")
    .notNull()
    .references(() => networks.id, { onDelete: "cascade" }),
});

export const colorEnum = pgEnum("color", [
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
  "orange",
]);

export const tags = pgTable("tags", {
  id: uuid(`id`).primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull().unique(),
  color: colorEnum("color"),
  networkId: uuid("network_id")
    .notNull()
    .references(() => networks.id, { onDelete: "cascade" }),
});

export const devicesTags = pgTable(
  "devices_tags",
  {
    deviceId: uuid("device_id")
      .notNull()
      .references(() => devices.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.deviceId, t.tagId] })],
);

export const roleEnum = pgEnum("user_role", ["admin", "user"]);

export const networkUsers = pgTable(
  "network_users",
  {
    networkId: uuid("network_id")
      .notNull()
      .references(() => networks.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: roleEnum("role").default("user"),
  },
  (t) => [primaryKey({ columns: [t.networkId, t.userId] })],
);

export const protocolEnum = pgEnum("protocol", ["TCP", "UDP", "ICMP"]);

export const rules = pgTable("rules", {
  id: uuid(`id`).primaryKey().defaultRandom(),
  sourceId: uuid("source_id").references(() => tags.id),
  destId: uuid("dest_id").references(() => tags.id),
  description: varchar({ length: 255 }),
  protocol: protocolEnum("protocol"),
  port: integer(),
  networkId: uuid("network_id")
    .notNull()
    .references(() => networks.id, { onDelete: "cascade" }),
});

export const relations = defineRelations(
  {
    user,
    session,
    account,
    networks,
    devices,
    tags,
    devicesTags,
    rules,
    networkUsers,
  },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
      networks: r.many.networks({
        from: r.user.id.through(r.networkUsers.userId),
        to: r.networks.id.through(r.networkUsers.networkId),
      }),
    },

    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
    },

    account: {
      user: r.one.user({
        from: r.account.userId,
        to: r.user.id,
      }),
    },

    networks: {
      users: r.many.user({
        from: r.networks.id.through(r.networkUsers.networkId),
        to: r.user.id.through(r.networkUsers.userId),
      }),
      devices: r.many.devices(),
      tags: r.many.tags(),
      rules: r.many.rules(),
      creator: r.one.user({
        from: r.networks.creatorId,
        to: r.user.id,
      }),
    },

    devices: {
      network: r.one.networks({
        from: r.devices.networkId,
        to: r.networks.id,
      }),
      tags: r.many.tags({
        from: r.devices.id.through(r.devicesTags.deviceId),
        to: r.tags.id.through(r.devicesTags.tagId),
      }),
      owner: r.one.user({
        from: r.devices.ownerId,
        to: r.user.id,
      }),
    },

    tags: {
      network: r.one.networks({
        from: r.tags.networkId,
        to: r.networks.id,
      }),
      devices: r.many.devices(),
      sourceRules: r.many.rules({
        from: r.tags.id,
        to: r.rules.sourceId,
      }),
      destRules: r.many.rules({
        from: r.tags.id,
        to: r.rules.destId,
      }),
    },

    rules: {
      network: r.one.networks({
        from: r.rules.networkId,
        to: r.networks.id,
      }),
      source: r.one.tags({
        from: r.rules.sourceId,
        to: r.tags.id,
      }),
      dest: r.one.tags({
        from: r.rules.destId,
        to: r.tags.id,
      }),
    },
  }),
);
