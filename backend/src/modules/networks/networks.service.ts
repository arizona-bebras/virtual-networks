import { Injectable } from '@nestjs/common';
import { Network } from './interfaces/network.interface';
import { db } from '../../db/connection';
import { networks } from '../../db/schema';
import { eq } from 'drizzle-orm/sql/expressions/conditions';


@Injectable()
export class NetworksService {
    async create(network: Network) {
        await db.insert(networks).values(network);
    }

    async read(id: string) {
        return await db.select().from(networks).where(eq(networks.id, id));
    }

    async update(id: string, network: Network) {
        await db.update(networks).set(network).where(eq(networks.id, id));
    }

    async delete(id: string) {
        await db.delete(networks).where(eq(networks.id, id));
    }
}
