import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { DeviceRelations } from "common/schemas/device/index";
import { sql } from "drizzle-orm";
import { ClsServiceManager } from "nestjs-cls";
import request from "supertest";
import type { App } from "supertest/types.js";
import { Role } from "../src/authorization/role.enum.js";
import { RolesGuard } from "../src/authorization/roles.guard.js";
import { DRIZZLE } from "../src/db/database.module.js";
import * as schema from "../src/db/schema.js";
import { DevicesController } from "../src/modules/devices/devices.controller.js";
import { DevicesService } from "../src/modules/devices/devices.service.js";
import { WireguardCfgService } from "../src/modules/devices/wireguardcfg.service.js";
import { RouterService } from "../src/modules/router/router.service.js";
import {
  closeTestDatabase,
  createTestDatabase,
  type TestDatabase,
} from "./test-database.js";

const networkId = "11111111-1111-1111-1111-111111111111";
const otherNetworkId = "22222222-2222-2222-2222-222222222222";
const userId = "user-1";
const user = {
  id: userId,
  email: "user@example.test",
  name: "Test User",
};
const deviceId = "33333333-3333-3333-3333-333333333333";
const tagId = "44444444-4444-4444-4444-444444444444";

const createDevicesTestDatabase = async () => {
  const db = await createTestDatabase();
  await db.insert(schema.user).values(user);
  await db.insert(schema.networks).values([
    {
      id: networkId,
      cidr: "10.0.0.0/24",
      creatorId: userId,
      description: "Primary network",
      name: "Primary",
      domain: "primary",
    },
    {
      id: otherNetworkId,
      cidr: "10.1.0.0/24",
      creatorId: userId,
      description: "Other network",
      name: "Other",
      domain: "other",
    },
  ]);
  await db.insert(schema.networkUsers).values({
    networkId,
    role: Role.Admin,
    userId,
  });
  await db.insert(schema.tags).values({
    id: tagId,
    color: "green",
    name: "backend",
    networkId,
  });

  return db;
};

describe("DevicesController (e2e)", () => {
  let app: INestApplication<App>;
  let db: TestDatabase;

  beforeEach(async () => {
    db = await createDevicesTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DevicesController],
      providers: [
        DevicesService,
        RolesGuard,
        WireguardCfgService,
        RouterService,
        {
          provide: DRIZZLE,
          useFactory: () => {
            const cls = ClsServiceManager.getClsService();
            return new Proxy(db, {
              get(target, prop) {
                const tx = cls.get("CURRENT_TRANSACTION");
                // Если функция, обязательно биндим её контекст, чтобы Drizzle не ругался
                if (tx && typeof tx[prop] === "function") {
                  return tx[prop].bind(tx);
                }
                return tx ? tx[prop] : target[prop];
              },
            });
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use((req, _res, next) => {
      req.session = { user: { id: userId } };
      next();
    });

    app.use((req, _res, next) => {
      const cls = ClsServiceManager.getClsService();

      cls.run(() => {
        cls.set("userId", req?.session?.user?.id);
        next();
      });
    });

    await app.init();
  });

  afterEach(async () => {
    await app?.close();
    await closeTestDatabase(db);
  });

  it("creates and reads devices through HTTP requests", async () => {
    await request(app.getHttpServer())
      .post(`/networks/${networkId}/devices`)
      .send({ id: deviceId, ip: "10.0.0.2", name: "Laptop", slug: "laptop" })
      .expect(201)
      .expect({ id: deviceId });

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/devices`)
      .expect(200)
      .expect((response) => {
        const devices = response.body as DeviceRelations[];

        expect(devices).toEqual([
          {
            id: deviceId,
            ip: "10.0.0.2",
            name: "Laptop",
            slug: "laptop",
            networkId,
            ownerId: userId,
            owner: user,
            tags: [],
          },
        ]);
      });

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/devices/${deviceId}`)
      .expect(200)
      .expect((response) => {
        const device = response.body as DeviceRelations;

        expect(device).toEqual({
          id: deviceId,
          ip: "10.0.0.2",
          name: "Laptop",
          slug: "laptop",
          networkId,
          ownerId: userId,
          owner: user,
          tags: [],
        });
      });
  });

  it("returns 404 when a device does not exist", async () => {
    await request(app.getHttpServer())
      .get(`/networks/${networkId}/devices/${deviceId}`)
      .expect(404);
  });

  it("updates and deletes a device through HTTP requests", async () => {
    await db.insert(schema.devices).values({
      id: deviceId,
      ip: "10.0.0.3",
      name: "Tablet",
      slug: "tablet",
      networkId,
      ownerId: userId,
    });

    await request(app.getHttpServer())
      .put(`/networks/${networkId}/devices/${deviceId}`)
      .send({ name: "Workstation" })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/devices/${deviceId}`)
      .expect(200)
      .expect((response) => {
        const device = response.body as DeviceRelations;
        expect(device.name).toBe("Workstation");
      });

    await request(app.getHttpServer())
      .delete(`/networks/${networkId}/devices/${deviceId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/devices/${deviceId}`)
      .expect(404);
  });

  it("adds and removes tags through HTTP requests", async () => {
    await db.insert(schema.devices).values({
      id: deviceId,
      ip: "10.0.0.4",
      name: "Server",
      slug: "server",
      networkId,
      ownerId: userId,
    });

    await request(app.getHttpServer())
      .post(`/networks/${networkId}/devices/${deviceId}/add_tag/${tagId}`)
      .expect(201);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/devices/${deviceId}`)
      .expect(200)
      .expect((response) => {
        const device = response.body as DeviceRelations;

        expect(device.tags).toEqual([
          {
            id: tagId,
            color: "green",
            name: "backend",
          },
        ]);
      });

    await request(app.getHttpServer())
      .delete(`/networks/${networkId}/devices/${deviceId}/add_tag/${tagId}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/devices/${deviceId}`)
      .expect(200)
      .expect((response) => {
        const device = response.body as DeviceRelations;
        expect(device.tags).toEqual([]);
      });
  });

  it("rejects requests outside of the current user's network", async () => {
    await request(app.getHttpServer())
      .get(`/networks/${otherNetworkId}/devices`)
      .expect(403);
  });

  it("persists changes in the in-memory PGlite database", async () => {
    await request(app.getHttpServer())
      .post(`/networks/${networkId}/devices`)
      .send({ id: deviceId, ip: "10.0.0.5", name: "Desktop", slug: "desktop" })
      .expect(201);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(schema.devices);

    expect(count).toBe(1);
  });
});
