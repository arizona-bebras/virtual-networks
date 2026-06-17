import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Tag } from "common/schemas/tag/index";
import { ClsServiceManager } from "nestjs-cls";
import request from "supertest";
import type { App } from "supertest/types.js";
import { Role } from "../src/authorization/role.enum.js";
import { RolesGuard } from "../src/authorization/roles.guard.js";
import { DRIZZLE } from "../src/db/database.module.js";
import * as schema from "../src/db/schema.js";
import { TagsController } from "../src/modules/tags/tags.controller.js";
import { TagsService } from "../src/modules/tags/tags.service.js";
import {
  closeTestDatabase,
  createTestDatabase,
  type TestDatabase,
} from "./test-database.js";

const userId = "user-1";
const networkId = "11111111-1111-1111-1111-111111111111";
const tagId = "44444444-4444-4444-4444-444444444444";
const otherTagId = "55555555-5555-5555-5555-555555555555";
const deviceId = "33333333-3333-3333-3333-333333333333";

const seedNetworkMember = async (db: TestDatabase) => {
  await db.insert(schema.user).values({
    id: userId,
    email: "user@example.test",
    name: "Test User",
  });
  await db.insert(schema.networks).values({
    id: networkId,
    cidr: "10.0.0.0/24",
    creatorId: userId,
    description: "Primary network",
    name: "Primary",
    domain: "primary",
  });
  await db.insert(schema.networkUsers).values({
    networkId,
    role: Role.Admin,
    userId,
  });
};

const seedTags = async (db: TestDatabase) => {
  await db.insert(schema.tags).values([
    {
      id: tagId,
      color: "green",
      name: "backend",
      networkId,
    },
    {
      id: otherTagId,
      color: "purple",
      name: "frontend",
      networkId,
    },
  ]);
};

describe("TagsController (e2e)", () => {
  let app: INestApplication<App>;
  let db: TestDatabase;

  beforeEach(async () => {
    db = await createTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        TagsService,
        RolesGuard,
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

  it("creates and lists tags through HTTP requests", async () => {
    await seedNetworkMember(db);

    await request(app.getHttpServer())
      .post(`/networks/${networkId}/tags`)
      .send({ color: "green", name: "backend" })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/tags`)
      .expect(200)
      .expect((response) => {
        const tags = response.body as Tag[];

        expect(tags).toEqual([
          {
            id: expect.any(String),
            color: "green",
            devicesCount: 0,
            name: "backend",
          },
        ]);
      });
  });

  it("reads tags with device counts and query filters", async () => {
    await seedNetworkMember(db);
    await seedTags(db);
    await db.insert(schema.devices).values({
      id: deviceId,
      ip: "10.0.0.2",
      name: "Laptop",
      slug: "laptop",
      networkId,
      ownerId: userId,
    });
    await db.insert(schema.devicesTags).values({
      deviceId,
      tagId,
    });

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/tags?q=back`)
      .expect(200)
      .expect((response) => {
        const tags = response.body as Tag[];

        expect(tags).toEqual([
          {
            id: tagId,
            color: "green",
            devicesCount: 1,
            name: "backend",
          },
        ]);
      });

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/tags/${tagId}`)
      .expect(200)
      .expect((response) => {
        const tag = response.body as Tag;

        expect(tag).toEqual({
          id: tagId,
          color: "green",
          devicesCount: 1,
          name: "backend",
          networkId,
        });
      });
  });

  it("updates and deletes a tag through HTTP requests", async () => {
    await seedNetworkMember(db);
    await seedTags(db);

    await request(app.getHttpServer())
      .put(`/networks/${networkId}/tags/${tagId}`)
      .send({ color: "blue", name: "backend-updated" })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/tags/${tagId}`)
      .expect(200)
      .expect((response) => {
        const tag = response.body as Tag;
        expect(tag).toMatchObject({
          color: "blue",
          name: "backend-updated",
        });
      });

    await request(app.getHttpServer())
      .delete(`/networks/${networkId}/tags/${tagId}`)
      .expect(200);

    const tag = await db.query.tags.findFirst({
      where: {
        id: tagId,
      },
    });
    expect(tag).toBeUndefined();
  });

  it("rejects tag requests for non-members", async () => {
    await db.insert(schema.user).values({
      id: userId,
      email: "user@example.test",
      name: "Test User",
    });
    await db.insert(schema.networks).values({
      id: networkId,
      cidr: "10.0.0.0/24",
      creatorId: userId,
      description: "Primary network",
      name: "Primary",
      domain: "primary",
    });

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/tags`)
      .expect(403);
  });
});
