import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm/sql/expressions/conditions";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";
import type { EnterCredentials, Network } from "./interfaces/network.interface";

@Injectable()
export class NetworksService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async create(networkData: Network, userId: string) {
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
    _credentials: EnterCredentials,
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
    return await this.db
      .select()
      .from(schema.networks)
      .where(eq(schema.networks.id, id));
  }

  async getMyNetworks(userId: string) {
    return await this.db
      .select()
      .from(schema.networks)
      .leftJoin(schema.networkUsers, eq(schema.networkUsers.networkId, schema.networks.id))
      .where(
        eq(schema.networkUsers.userId, userId)
      );
  }

  async update(id: string, network: Network) {
    await this.db
      .update(schema.networks)
      .set(network)
      .where(eq(schema.networks.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.networks).where(eq(schema.networks.id, id));
  }
}
