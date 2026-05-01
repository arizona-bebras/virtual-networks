import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { Role } from "./role.enum";
import { ROLES_KEY } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";

const createDbMock = () => ({
  query: {
    networkUsers: {
      findFirst: jest.fn(),
    },
  },
});

const createContext = (request: unknown): ExecutionContext => {
  const handler = jest.fn();
  class TargetController {}

  return {
    getClass: () => TargetController,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
};

describe("RolesGuard", () => {
  let db: ReturnType<typeof createDbMock>;
  let reflector: { getAllAndOverride: jest.Mock };
  let guard: RolesGuard;

  beforeEach(() => {
    db = createDbMock();
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector, db as never);
  });

  it("denies requests without a user session", async () => {
    const context = createContext({ params: { network_id: "network-1" } });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException("Not authorized"),
    );
    expect(db.query.networkUsers.findFirst).not.toHaveBeenCalled();
  });

  it("denies users outside of the target network", async () => {
    db.query.networkUsers.findFirst.mockResolvedValue(undefined);
    const context = createContext({
      params: { network_id: "network-1" },
      session: { user: { id: "user-1" } },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException("You are not in network"),
    );
    expect(db.query.networkUsers.findFirst).toHaveBeenCalledWith({
      where: {
        networkId: "network-1",
        userId: "user-1",
      },
    });
  });

  it("allows network members when no explicit roles are required", async () => {
    db.query.networkUsers.findFirst.mockResolvedValue({ role: Role.User });
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createContext({
      params: { network_id: "network-1" },
      session: { user: { id: "user-1" } },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });

  it("allows members whose role matches the required roles", async () => {
    db.query.networkUsers.findFirst.mockResolvedValue({ role: Role.Admin });
    reflector.getAllAndOverride.mockReturnValue([Role.Admin]);
    const context = createContext({
      params: { network_id: "network-1" },
      session: { user: { id: "user-1" } },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it("denies members whose role does not match the required roles", async () => {
    db.query.networkUsers.findFirst.mockResolvedValue({ role: Role.User });
    reflector.getAllAndOverride.mockReturnValue([Role.Admin]);
    const context = createContext({
      params: { network_id: "network-1" },
      session: { user: { id: "user-1" } },
    });

    await expect(guard.canActivate(context)).resolves.toBe(false);
  });
});
