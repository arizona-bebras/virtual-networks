import { Injectable } from '@nestjs/common';
import { db } from '../../db/connection'
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {

    async create(user: User) {
        await db.insert(users).values(user);
    }

    async read(id: string) {
        return await db.select().from(users).where(eq(users.id, id));
    }

    async update(id: string, user: User) {
        await db.update(users).set(user).where(eq(users.id, id));
    }

    async delete(id: string) {
        await db.delete(users).where(eq(users.id, id));
    }
}
