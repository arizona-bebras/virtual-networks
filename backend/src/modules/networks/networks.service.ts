import { generateKeyPairSync } from "node:crypto";
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { CreateNetworkDto } from "common/dto/network/create-network";
import type { NetworkEnterCredentialsDto } from "common/dto/network/enter-credentials";
import { NetworkDto } from "common/dto/network/index";
import type { NetworkUsersDto } from "common/dto/network/network-users";
import type { UpdateNetworkDto } from "common/dto/network/update-network";
import { sql } from "drizzle-orm";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import { Address4 } from "ip-address";
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
      const { publicKey, privateKey } = generateKeyPairSync("x25519");
      const [keys] = await tx
        .insert(schema.keys)
        .values({
          publicKey: publicKey
            .export({ type: "spki", format: "der" })
            .slice(12),
          privateKey: privateKey
            .export({ type: "pkcs8", format: "der" })
            .slice(16),
        })
        .returning();
      const [network] = await tx
        .insert(schema.networks)
        .values({ ...networkData, creatorId: userId, keysId: keys.id })
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
        keysId: false,
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

  async getNetworkUsers(
    networkId: string,
    userId: string,
  ): Promise<NetworkUsersDto> {
    const users = await this.db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
        role: schema.networkUsers.role,
      })
      .from(schema.user)
      .innerJoin(
        schema.networkUsers,
        and(
          eq(schema.networkUsers.userId, schema.user.id),
          eq(schema.networkUsers.networkId, networkId),
        ),
      );

    if (!users.find((user) => user.id === userId)) {
      throw new ForbiddenException("You must be in network");
    }

    return { users };
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
            keysId: false,
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

  async getFreeIp(networkId: string): Promise<string> {
    return await this.db.transaction(async (tx) => {
      const networks = await tx
        .select({ cidr: schema.networks.cidr })
        .from(schema.networks)
        .where(eq(schema.networks.id, networkId))
        .for("update");

      const network = networks[0];

      if (!network) {
        throw new NotFoundException(`Network with id ${networkId} not found`);
      }

      const cidr = new Address4(network.cidr);

      const devices = await tx
        .select({
          ip: schema.devices.ip,
        })
        .from(schema.devices)
        .where(eq(schema.devices.networkId, networkId));

      const ipSet = new Set(devices.map((device) => device.ip));

      for (let i = 0; i < 2 ** (32 - cidr.subnetMask) - 1; i++) {
        const next_ip_num =
          cidr.startAddressExclusive().bigInt() + 1n * BigInt(i);
        const next_ip = Address4.fromBigInt(next_ip_num).correctForm();
        if (
          !ipSet.has(next_ip) &&
          next_ip !== cidr.endAddress().correctForm()
        ) {
          return next_ip;
        }
      }
      throw new BadRequestException(`The subnet is full`);
    });
  }
}
