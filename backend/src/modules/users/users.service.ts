import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../../db/database.module";
import * as schema from "../../db/schema";
import { User } from "./interfaces/user.interface";

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}
  async create(user: User) {
    await this.db.insert(schema.users).values(user);
  }

  async read(id: string) {
    return await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
  }

  async update(id: string, user: User) {
    await this.db.update(schema.users).set(user).where(eq(schema.users.id, id));
  }

  async delete(id: string) {
    await this.db.delete(schema.users).where(eq(schema.users.id, id));
  }
}
