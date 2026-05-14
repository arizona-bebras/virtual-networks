import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { UserSession } from "@thallesp/nestjs-better-auth";
import { type Database, DRIZZLE } from "../db/database.module.js";
import type { Role } from "./role.enum.js";
import { ROLES_KEY } from "./roles.decorator.js";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DRIZZLE) private readonly db: Database,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const session: UserSession = req.session;

    if (!session?.user) {
      throw new ForbiddenException("Not authorized");
    }

    const userId = session.user.id;
    const networkId = req.params.network_id;

    const membership = await this.db.query.networkUsers.findFirst({
      where: {
        userId,
        networkId,
      },
    });

    if (!membership) {
      throw new ForbiddenException("You are not in network");
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    return requiredRoles.some((r) => r === membership.role);
  }
}
