import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { CreateNetworkDto } from "common/dto/network/create-network";
import type { NetworkEnterCredentialsDto } from "common/dto/network/enter-credentials";
import { NetworkDto } from "common/dto/network/index";
import type { UpdateNetworkDto } from "common/dto/network/update-network";
import { sql } from "drizzle-orm";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { type Database, DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

@Injectable()
export class NetworksService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(
    networkData: CreateNetworkDto,
    userId: string,
  ): Promise<NetworkDto | undefined> {
    return this.db.transaction(async (tx) => {
      const [network] = await tx
        .insert(schema.networks)
        .values({ ...networkData, creatorId: userId })
        .returning({
          id: schema.networks.id,
          name: schema.networks.name,
          description: schema.networks.description,
          cidr: schema.networks.cidr,
          creatorId: schema.networks.creatorId,
          devicesCount: sql<number>`0`.as("devices_count"),
        });

      await tx.insert(schema.networkUsers).values({
        networkId: network.id,
        userId,
        role: "admin",
      });

      const creator = await tx.query.user.findFirst({
        columns: {
          id: true,
          name: true,
          email: true,
        },
        where: {
          id: userId,
        },
      });

      if (!creator) {
        throw new BadRequestException("bad creator id: user doesn't exists");
      }

      return { ...network, creator };
    });
  }

  async enter(
    _credentials: NetworkEnterCredentialsDto,
    networkId: string,
    userId: string,
  ) {
    await this.db.insert(schema.networkUsers).values({
      userId,
      networkId,
      role: "user",
    });
  }

  async read(id: string): Promise<NetworkDto | undefined> {
    return this.db.query.networks.findFirst({
      columns: {
        id: true,
        name: true,
        description: true,
        cidr: true,
        creatorId: true,
      },
      where: {
        id,
      },
      with: {
        creator: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      extras: {
        devicesCount:
          sql<number>`(SELECT COUNT(*) FROM ${schema.devices} WHERE ${schema.devices.networkId} = ${id})`
            .mapWith(Number)
            .as("devices_count"),
      },
    });
  }

  async getMyNetworks(userId: string): Promise<NetworkDto[]> {
    const user = await this.db.query.user.findFirst({
      columns: {},
      where: {
        id: userId,
      },
      with: {
        networks: {
          extras: {
            devicesCount: (networks, { sql }) =>
              sql<number>`(
              SELECT COUNT(*)::int 
              FROM ${schema.devices} 
              WHERE ${schema.devices.networkId} = ${networks.id}
            )`
                .mapWith(Number)
                .as("devices_count"),
          },
          columns: {
            id: true,
            name: true,
            description: true,
            cidr: true,
            creatorId: true,
          },
          with: {
            creator: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return user?.networks ?? [];
  }

  async update(id: string, network: UpdateNetworkDto) {
    await this.db
      .update(schema.networks)
      .set(network)
      .where(eq(schema.networks.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.networks).where(eq(schema.networks.id, id));
  }
}
