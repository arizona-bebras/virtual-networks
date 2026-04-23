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
    return this.db.query.networks.findFirst({
      where: {
        id,
      },
    });
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
