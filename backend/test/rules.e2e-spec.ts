import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import type { RuleRelation } from "common/schemas/rule/index";
import request from "supertest";
import type { App } from "supertest/types.js";
import { Role } from "../src/authorization/role.enum.js";
import { RolesGuard } from "../src/authorization/roles.guard.js";
import { DRIZZLE } from "../src/db/database.module.js";
import * as schema from "../src/db/schema.js";
import { RulesController } from "../src/modules/rules/rules.controller.js";
import { RulesService } from "../src/modules/rules/rules.service.js";
import {
  closeTestDatabase,
  createTestDatabase,
  type TestDatabase,
} from "./test-database.js";

const userId = "user-1";
const networkId = "11111111-1111-1111-1111-111111111111";
const sourceTagId = "44444444-4444-4444-4444-444444444444";
const destTagId = "55555555-5555-5555-5555-555555555555";
const ruleId = "66666666-6666-6666-6666-666666666666";

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
      id: sourceTagId,
      color: "green",
      name: "source",
      networkId,
    },
    {
      id: destTagId,
      color: "purple",
      name: "dest",
      networkId,
    },
  ]);
};

const seedRule = async (db: TestDatabase) => {
  await db.insert(schema.rules).values({
    id: ruleId,
    description: "Allow backend",
    destId: destTagId,
    networkId,
    port: 443,
    protocol: "TCP",
    sourceId: sourceTagId,
  });
};

describe("RulesController (e2e)", () => {
  let app: INestApplication<App>;
  let db: TestDatabase;

  beforeEach(async () => {
    db = await createTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RulesController],
      providers: [
        RulesService,
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

  it("creates and lists rules through HTTP requests", async () => {
    await seedNetworkMember(db);
    await seedTags(db);

    await request(app.getHttpServer())
      .post(`/networks/${networkId}/rules`)
      .send({
        description: "Allow HTTPS",
        destId: destTagId,
        port: 443,
        protocol: "TCP",
        sourceId: sourceTagId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/rules`)
      .expect(200)
      .expect((response) => {
        const rules = response.body as RuleRelation[];

        expect(rules).toHaveLength(1);
        expect(rules[0]).toMatchObject({
          description: "Allow HTTPS",
          destId: destTagId,
          port: 443,
          protocol: "TCP",
          source: {
            id: sourceTagId,
            color: "green",
            devicesCount: 0,
            name: "source",
          },
          sourceId: sourceTagId,
        });
      });
  });

  it("reads, updates, and deletes a rule through HTTP requests", async () => {
    await seedNetworkMember(db);
    await seedTags(db);
    await seedRule(db);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/rules/${ruleId}`)
      .expect(200)
      .expect((response) => {
        const rule = response.body as RuleRelation;

        expect(rule).toMatchObject({
          id: ruleId,
          description: "Allow backend",
          dest: {
            id: destTagId,
            color: "purple",
            devicesCount: 0,
            name: "dest",
          },
          port: 443,
          protocol: "TCP",
          source: {
            id: sourceTagId,
            color: "green",
            devicesCount: 0,
            name: "source",
          },
        });
      });

    await request(app.getHttpServer())
      .put(`/networks/${networkId}/rules/${ruleId}`)
      .send({ description: "Allow updated backend", port: 8443 })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/rules/${ruleId}`)
      .expect(200)
      .expect((response) => {
        const rule = response.body as RuleRelation;

        expect(rule).toMatchObject({
          description: "Allow updated backend",
          port: 8443,
        });
      });

    await request(app.getHttpServer())
      .delete(`/networks/${networkId}/rules/${ruleId}`)
      .expect(200);

    const rule = await db.query.rules.findFirst({
      where: {
        id: ruleId,
      },
    });
    expect(rule).toBeUndefined();
  });

  it("rejects rule requests for non-members", async () => {
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
    });

    await request(app.getHttpServer())
      .get(`/networks/${networkId}/rules`)
      .expect(403);
  });
});
