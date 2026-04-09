import { Injectable } from '@nestjs/common';
import type { Tag } from '../interfaces/network.interface';
import { db } from '../../../db/connection';
import { tags } from '../../../db/schema';
import { eq } from 'drizzle-orm/sql/expressions/conditions';

@Injectable()
export class TagsService {
  async create(tag: Tag, network_id: string) {
    tag.network_id = network_id;
    await db.insert(tags).values(tag);
  }

  async read(id: string) {
    return await db.select().from(tags).where(eq(tags.id, id));
  }

  async update(id: string, tag: Tag) {
    await db.update(tags).set(tag).where(eq(tags.id, id));
  }

  async delete(id: string) {
    await db.delete(tags).where(eq(tags.id, id));
  }
}
