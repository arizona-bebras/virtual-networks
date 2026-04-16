import { Inject, Injectable } from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";
import { Network } from "./interfaces/network.interface";

@Injectable()
export class NetworksService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async create(network: Network) {
    await this.db.insert(schema.networks).values(network);
  }

  async read(id: string) {
    return await this.db
      .select()
      .from(schema.networks)
      .where(eq(schema.networks.id, id));
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
