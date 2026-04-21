import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { and, eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../db/database.module";
import * as schema from "../db/schema";
import type { Role } from "./role.enum";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const session: UserSession = req.session;

    if (!session?.user) {
      throw new ForbiddenException("Not authorized");
    }

    const userId = session.user.id;
    const networkId = req.params.network_id;

    const [membership] = await this.db
      .select()
      .from(schema.networkUsers)
      .where(
        and(
          eq(schema.networkUsers.userId, userId),
          eq(schema.networkUsers.networkId, networkId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new ForbiddenException("You are not in network");
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log(requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    return requiredRoles.some((r) => r === membership.role);
  }
}
