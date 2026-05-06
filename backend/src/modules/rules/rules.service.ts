import { Inject, Injectable } from "@nestjs/common";
import type { CreateRuleDto } from "common/dto/rule/create-rule";
import { RuleDto } from "common/dto/rule/index";
import type { UpdateRuleDto } from "common/dto/rule/update-rule";
import {
  and,
  eq,
  ilike,
  inArray,
} from "drizzle-orm/sql/expressions/conditions";
import { type Database, DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

@Injectable()
export class RulesService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(rule: CreateRuleDto, networkId: string) {
    await this.db.insert(schema.rules).values({ ...rule, networkId });
  }

  async get(ruleId: string): Promise<RuleDto | undefined> {
    return this.db.query.rules.findFirst({
      where: {
        id: ruleId,
      },
      with: {
        source: {
          columns: {
            id: true,
            name: true,
            color: true,
          },
          extras: {
            devicesCount: (tags, { sql }) =>
              sql<number>`(
              SELECT COUNT(*)::int
              FROM ${schema.devicesTags}
              WHERE ${schema.devicesTags.tagId} = ${tags.id}
            )`
                .mapWith(Number)
                .as("devices_count"),
          },
        },
        dest: {
          columns: {
            id: true,
            name: true,
            color: true,
          },
          extras: {
            devicesCount: (tags, { sql }) =>
              sql<number>`(
              SELECT COUNT(*)::int
              FROM ${schema.devicesTags}
              WHERE ${schema.devicesTags.tagId} = ${tags.id}
            )`
                .mapWith(Number)
                .as("devices_count"),
          },
        },
      },
    });
  }

  async getRules(
    networkId: string,
    q?: string,
    sourceTags?: string[],
    destTags?: string[],
  ): Promise<RuleDto[]> {
    if (sourceTags && !Array.isArray(sourceTags)) {
      sourceTags = [sourceTags];
    }
    if (destTags && !Array.isArray(destTags)) {
      destTags = [destTags];
    }
    return this.db.query.rules.findMany({
      where: {
        RAW: (rules) =>
          and(
            eq(rules.networkId, networkId),
            q ? ilike(rules.description, `${q}%`) : undefined,
            sourceTags?.length
              ? inArray(rules.sourceId, sourceTags)
              : undefined,
            destTags?.length ? inArray(rules.destId, destTags) : undefined,
          )!,
      },
      with: {
        source: {
          columns: {
            id: true,
            name: true,
            color: true,
          },
          extras: {
            devicesCount: (tags, { sql }) =>
              sql<number>`(
              SELECT COUNT(*)::int
              FROM ${schema.devicesTags}
              WHERE ${schema.devicesTags.tagId} = ${tags.id}
            )`
                .mapWith(Number)
                .as("devices_count"),
          },
        },
        dest: {
          columns: {
            id: true,
            name: true,
            color: true,
          },
          extras: {
            devicesCount: (tags, { sql }) =>
              sql<number>`(
              SELECT COUNT(*)::int
              FROM ${schema.devicesTags}
              WHERE ${schema.devicesTags.tagId} = ${tags.id}
            )`
                .mapWith(Number)
                .as("devices_count"),
          },
        },
      },
    });
  }

  async update(ruleId: string, rule: UpdateRuleDto) {
    await this.db
      .update(schema.rules)
      .set(rule)
      .where(eq(schema.rules.id, ruleId));
  }

  async delete(ruleId: string) {
    await this.db.delete(schema.rules).where(eq(schema.rules.id, ruleId));
  }
}
