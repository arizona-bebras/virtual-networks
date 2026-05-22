import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Network } from "common/schemas/network/index";
import request from "supertest";
import type { App } from "supertest/types.js";
import { Role } from "../src/authorization/role.enum.js";
import { RolesGuard } from "../src/authorization/roles.guard.js";
import { DRIZZLE } from "../src/db/database.module.js";
import * as schema from "../src/db/schema.js";
import { NetworksController } from "../src/modules/networks/networks.controller.js";
import { NetworksService } from "../src/modules/networks/networks.service.js";
import {
  closeTestDatabase,
  createTestDatabase,
  type TestDatabase,
} from "./test-database.js";

const userId = "user-1";
const networkId = "11111111-1111-1111-1111-111111111111";
const otherUserId = "user-2";

const seedUser = async (db: TestDatabase, id = userId) => {
  await db.insert(schema.user).values({
    id,
    email: `${id}@example.test`,
    name: `Test ${id}`,
  });
};

const seedNetwork = async (db: TestDatabase) => {
  await db.insert(schema.networks).values({
    id: networkId,
    cidr: "10.0.0.0/24",
    creatorId: userId,
    description: "Primary network",
    name: "Primary",
  });
};

const seedAdminMembership = async (db: TestDatabase) => {
  await db.insert(schema.networkUsers).values({
    networkId,
    role: Role.Admin,
    userId,
  });
};

describe("NetworksController (e2e)", () => {
  let app: INestApplication<App>;
  let db: TestDatabase;

  beforeEach(async () => {
    db = await createTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [NetworksController],
      providers: [
        NetworksService,
        RolesGuard,
        {
          provide: DRIZZLE,
          useValue: db,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req, _res, next) => {
      req.session = { user: { id: userId } };
      next();
    });
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
    await closeTestDatabase(db);
  });

  it("creates a network and adds the current user as admin", async () => {
    await seedUser(db);

    await request(app.getHttpServer())
      .post("/networks")
      .send({
        cidr: "10.2.0.0/24",
        description: "Created over HTTP",
        name: "Created",
      })
      .expect(201)
      .expect((response) => {
        const network = response.body as Network;

        expect(network).toMatchObject({
          cidr: "10.2.0.0/24",
          creator: {
            email: "user-1@example.test",
            id: userId,
            name: "Test user-1",
          },
          creatorId: userId,
          description: "Created over HTTP",
          devicesCount: 0,
          name: "Created",
        });
        expect(network.id).toEqual(expect.any(String));
      });

    await request(app.getHttpServer())
      .get("/networks")
      .expect(200)
      .expect((response) => {
        const networks = response.body as Network[];

        expect(networks).toHaveLength(1);
        expect(networks[0]).toMatchObject({
          description: "Created over HTTP",
          name: "Created",
        });
      });
  });

  it("reads, updates, and deletes a network through HTTP requests", async () => {
    await seedUser(db);
    await seedNetwork(db);
    await seedAdminMembership(db);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}`)
      .expect(200)
      .expect((response) => {
        const network = response.body as Network;
        expect(network).toMatchObject({
          id: networkId,
          name: "Primary",
          devicesCount: 0,
        });
      });

    await request(app.getHttpServer())
      .put(`/networks/${networkId}`)
      .send({ name: "Updated" })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}`)
      .expect(200)
      .expect((response) => {
        const network = response.body as Network;
        expect(network.name).toBe("Updated");
      });

    await request(app.getHttpServer())
      .delete(`/networks/${networkId}`)
      .expect(200);

    const network = await db.query.networks.findFirst({
      where: {
        id: networkId,
      },
    });
    expect(network).toBeUndefined();
  });

  it("enters an existing network as a regular user", async () => {
    await seedUser(db);
    await seedUser(db, otherUserId);
    await seedNetwork(db);

    await request(app.getHttpServer())
      .post(`/networks/${networkId}`)
      .send({})
      .expect(201);

    const membership = await db.query.networkUsers.findFirst({
      where: {
        networkId,
        userId,
      },
    });

    expect(membership).toMatchObject({
      networkId,
      role: Role.User,
      userId,
    });
  });

  it("rejects protected network requests for non-members", async () => {
    await seedUser(db);
    await seedNetwork(db);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}`)
      .expect(403);
  });
});
