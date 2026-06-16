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
import type { IpAddressStatusDto } from "common/dto/network/ip-address-status";
import type { NetworkUsersDto } from "common/dto/network/network-users";
import type { UpdateNetworkDto } from "common/dto/network/update-network";
import { sql } from "drizzle-orm";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import { Address4 } from "ip-address";
import {
  ChangedResourceType,
  ChangeOperation,
  ConfigurationUpdateReason,
} from "proto";
import { type Database, DRIZZLE } from "../../db/database.module.js";
import * as schema from "../../db/schema.js";
import { LogEvents } from "../../logging/logging.decorator.js";
import { RouterService } from "../router/router.service.js";
import { ClsServiceManager } from "nestjs-cls";

@LogEvents("network")
@Injectable()
export class NetworksService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly routerService: RouterService,
  ) {}

  async create(
    networkData: CreateNetworkDto,
  ): Promise<NetworkDto | undefined> {
    const userId = ClsServiceManager.getClsService().get("userId");
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
          domain: schema.networks.domain,
          description: schema.networks.description,
          cidr: schema.networks.cidr,
          creatorId: schema.networks.creatorId,
          devicesCount: sql<number>`0`.as("devices_count"),
        });

      await tx.insert(schema.rules).values({
        networkId: network.id,
        description: "Разрешить всё",
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

      this.routerService.emitEvent(
        ConfigurationUpdateReason.CONFIGURATION_UPDATE_REASON_NETWORK_CHANGED,
        [
          {
            type: ChangedResourceType.CHANGED_RESOURCE_TYPE_NETWORK,
            id: crypto.randomUUID(),
            networkId: network.id,
            operation: ChangeOperation.CHANGE_OPERATION_CREATED,
          },
        ],
      );

      return { ...network, creator };
    });
  }

  async enter(
    _credentials: NetworkEnterCredentialsDto,
    networkId: string,
  ) {
    const userId = ClsServiceManager.getClsService().get("userId");
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
        domain: true,
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
  ): Promise<NetworkUsersDto> {
    const userId = ClsServiceManager.getClsService().get("userId");
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

  async getMyNetworks(): Promise<NetworkDto[]> {
    const userId = ClsServiceManager.getClsService().get("userId");
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
            domain: true,
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
    this.routerService.emitEvent(
      ConfigurationUpdateReason.CONFIGURATION_UPDATE_REASON_NETWORK_CHANGED,
      [
        {
          type: ChangedResourceType.CHANGED_RESOURCE_TYPE_NETWORK,
          id: crypto.randomUUID(),
          networkId: id,
          operation: ChangeOperation.CHANGE_OPERATION_UPDATED,
        },
      ],
    );
  }

  async delete(id: string) {
    await this.db.delete(schema.networks).where(eq(schema.networks.id, id));
    this.routerService.emitEvent(
      ConfigurationUpdateReason.CONFIGURATION_UPDATE_REASON_NETWORK_CHANGED,
      [
        {
          type: ChangedResourceType.CHANGED_RESOURCE_TYPE_NETWORK,
          id: crypto.randomUUID(),
          networkId: id,
          operation: ChangeOperation.CHANGE_OPERATION_DELETED,
        },
      ],
    );
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

      for (let i = 1; i < 2 ** (32 - cidr.subnetMask) - 1; i++) {
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

  async checkIpAvailability(
    networkId: string,
    ipString: string,
  ): Promise<IpAddressStatusDto> {
    const network = await this.db.query.networks.findFirst({
      where: {
        id: networkId,
      },
      with: {
        devices: {
          columns: {
            name: true,
            ip: true,
          },
        },
      },
    });

    if (!network) {
      throw new NotFoundException("Network not found");
    }

    if (!Address4.isValid(ipString)) {
      throw new BadRequestException("Invalid ip address input");
    }

    const ip = new Address4(ipString);
    const subnet = new Address4(network.cidr);

    if (
      !ip.isInSubnet(subnet) ||
      ip === subnet.startAddress() ||
      ip === subnet.endAddress()
    ) {
      return {
        status: "outOfSubnet",
      };
    }

    if (ip.address === subnet.startAddress().address) {
      return {
        status: "alreadyInUse",
        ownerHostName: "_network_address",
      };
    }

    if (ip.address === subnet.endAddress().address) {
      return {
        status: "alreadyInUse",
        ownerHostName: "_broadcast",
      };
    }

    for (const host of network.devices) {
      if (host.ip === ipString) {
        return {
          status: "alreadyInUse",
          ownerHostName: host.name,
        };
      }
    }

    return {
      status: "available",
    };
  }
}
