import "reflect-metadata";
import { Role } from "./role.enum";
import { ROLES_KEY, Roles } from "./roles.decorator";

describe("Roles", () => {
  it("stores required roles as route metadata", () => {
    class TestController {
      @Roles(Role.Admin, Role.User)
      handle() {}
    }

    expect(
      Reflect.getMetadata(ROLES_KEY, TestController.prototype.handle),
    ).toEqual([Role.Admin, Role.User]);
  });
});
