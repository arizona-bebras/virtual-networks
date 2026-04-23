import { Inject, Injectable } from "@nestjs/common";
import type { CreateNetworkDto } from "common/dto/network/create-network";
import type { NetworkEnterCredentialsDto } from "common/dto/network/enter-credentials";
import { NetworkDto } from "common/dto/network/index";
import type { UpdateNetworkDto } from "common/dto/network/update-network";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { type Database, DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

@Injectable()
export class NetworksService {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async create(
    networkData: CreateNetworkDto,
    userId: string,
  ): Promise<NetworkDto> {
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

      return network;
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

  async read(id: string) {
    const [network] = await this.db
      .select()
      .from(schema.networks)
      .where(eq(schema.networks.id, id))
      .limit(1);

    return network;
  }

  async getMyNetworks(
    userId: string,
  ): Promise<(typeof schema.networks.$inferSelect)[]> {
    return this.db
      .select({
        id: schema.networks.id,
        name: schema.networks.name,
        description: schema.networks.description,
        cidr: schema.networks.cidr,
      })
      .from(schema.networks)
      .innerJoin(
        schema.networkUsers,
        eq(schema.networkUsers.networkId, schema.networks.id),
      )
      .where(eq(schema.networkUsers.userId, userId));
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
