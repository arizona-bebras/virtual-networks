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
import {
  ChangedResourceType,
  ChangeOperation,
  ConfigurationUpdateReason,
} from "proto";
import { type Database, DRIZZLE } from "../../db/database.module.js";
import * as schema from "../../db/schema.js";
import { LogEvents } from "../../logging/logging.decorator.js";
import { RouterService } from "../router/router.service.js";

@LogEvents("rule")
@Injectable()
export class RulesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly routerService: RouterService,
  ) {}

  async create(rule: CreateRuleDto, networkId: string, _: string) {
    const [createdRule]= await this.db
      .insert(schema.rules)
      .values({ ...rule, networkId })
      .returning();
    this.emitRuleChanged(networkId, ChangeOperation.CHANGE_OPERATION_CREATED);
    return createdRule;
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

  async update(ruleId: string, rule: UpdateRuleDto, networkId: string) {
    await this.db
      .update(schema.rules)
      .set(rule)
      .where(
        and(eq(schema.rules.id, ruleId), eq(schema.rules.networkId, networkId)),
      );
    this.emitRuleChanged(networkId, ChangeOperation.CHANGE_OPERATION_UPDATED);
  }

  async delete(ruleId: string, networkId: string) {
    await this.db
      .delete(schema.rules)
      .where(
        and(eq(schema.rules.id, ruleId), eq(schema.rules.networkId, networkId)),
      );
    this.emitRuleChanged(networkId, ChangeOperation.CHANGE_OPERATION_DELETED);
  }

  private emitRuleChanged(networkId: string, operation: ChangeOperation) {
    this.routerService.emitEvent(
      ConfigurationUpdateReason.CONFIGURATION_UPDATE_REASON_NETWORK_CHANGED,
      [
        {
          type: ChangedResourceType.CHANGED_RESOURCE_TYPE_NETWORK,
          id: networkId,
          networkId,
          operation,
        },
      ],
    );
  }
}
