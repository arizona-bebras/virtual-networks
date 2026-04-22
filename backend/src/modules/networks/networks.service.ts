import { Inject, Injectable } from "@nestjs/common";
import type { CreateNetworkDto } from "common/dto/network/create-network";
import type { NetworkEnterCredentialsDto } from "common/dto/network/enter-credentials";
import type { UpdateNetworkDto } from "common/dto/network/update-network";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";

@Injectable()
export class NetworksService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async create(networkData: CreateNetworkDto, userId: string) {
    await this.db.transaction(async (tx) => {
      const [network] = await tx
        .insert(schema.networks)
        .values(networkData)
        .returning();
      await tx.insert(schema.networkUsers).values({
        networkId: network.id,
        userId: userId,
        role: "admin",
      });
    });
  }

  async enter(
    _credentials: NetworkEnterCredentialsDto,
    networkId: string,
    userId: string,
  ) {
    await this.db.insert(schema.networkUsers).values({
      userId: userId,
      networkId: networkId,
      role: "user",
    });
  }

  async read(id: string) {
    const networks = await this.db
      .select()
      .from(schema.networks)
      .where(eq(schema.networks.id, id))
      .limit(1);
    return networks[0];
  }

  async getMyNetworks(userId: string) {
    return await this.db
      .select()
      .from(schema.networks)
      .leftJoin(
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
