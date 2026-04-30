import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { CreateNetworkDto } from "common/dto/network/create-network";
import type { NetworkEnterCredentialsDto } from "common/dto/network/enter-credentials";
import { NetworkDto } from "common/dto/network/index";
import type { UpdateNetworkDto } from "common/dto/network/update-network";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
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
        .values(networkData)
        .returning();

      await tx.insert(schema.networkUsers).values({
        networkId: network.id,
        userId,
        role: "admin",
      });

      const admin = await tx.query.user.findFirst({
        columns: {
          id: true,
          name: true,
          email: true,
        },
        where: {
          id: userId,
        },
      });

      if (!admin) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      return { ...network, admin: admin };
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
    const network = await this.db.query.networks.findFirst({
      where: {
        id,
      },
    });

    if (!network) return undefined;
    const admin = await this.db
      .select({
        id: schema.user.id,
        name: schema.user.name,
        email: schema.user.email,
      })
      .from(schema.user)
      .leftJoin(
        schema.networkUsers,
        eq(schema.networkUsers.userId, schema.user.id),
      )
      .where(
        and(
          eq(schema.networkUsers.networkId, network.id),
          eq(schema.networkUsers.role, "admin"),
          eq(schema.networkUsers.userId, schema.user.id),
        ),
      );

    if (!admin[0]) {
      throw new BadRequestException(`Admin for network ${id} not found`);
    }

    return { ...network, admin: admin[0] };
  }

  async getMyNetworks(
    userId: string,
  ): Promise<(typeof schema.networks.$inferSelect)[]> {
    const user = await this.db.query.user.findFirst({
      columns: {},
      where: {
        id: userId,
      },
      with: {
        networks: true,
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
