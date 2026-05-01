import { NotFoundException } from "@nestjs/common";
import { NetworksController } from "./networks.controller";

const createNetworksServiceMock = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  enter: jest.fn(),
  getMyNetworks: jest.fn(),
  read: jest.fn(),
  update: jest.fn(),
});

describe("NetworksController", () => {
  let controller: NetworksController;
  let networksService: ReturnType<typeof createNetworksServiceMock>;

  beforeEach(() => {
    networksService = createNetworksServiceMock();
    controller = new NetworksController(networksService as never);
  });

  it("creates a network for the current user", async () => {
    const network = { id: "network-1", name: "Office" };
    const session = { user: { id: "user-1" } };
    networksService.create.mockResolvedValue(network);

    await expect(
      controller.create({ name: "Office" } as never, session as never),
    ).resolves.toBe(network);
    expect(networksService.create).toHaveBeenCalledWith(
      { name: "Office" },
      "user-1",
    );
  });

  it("returns networks for the current user", async () => {
    const networks = [{ id: "network-1" }];
    const session = { user: { id: "user-1" } };
    networksService.getMyNetworks.mockResolvedValue(networks);

    await expect(controller.getMyNetworks(session as never)).resolves.toBe(
      networks,
    );
    expect(networksService.getMyNetworks).toHaveBeenCalledWith("user-1");
  });

  it("returns a network when it exists", async () => {
    const network = { id: "network-1" };
    networksService.read.mockResolvedValue(network);

    await expect(controller.get("network-1")).resolves.toBe(network);
    expect(networksService.read).toHaveBeenCalledWith("network-1");
  });

  it("throws not found when a network does not exist", async () => {
    networksService.read.mockResolvedValue(undefined);

    await expect(controller.get("missing")).rejects.toThrow(NotFoundException);
  });

  it("enters a network for the current user", async () => {
    const credentials = { password: "secret" };
    const session = { user: { id: "user-1" } };

    await controller.enter(credentials as never, "network-1", session as never);

    expect(networksService.enter).toHaveBeenCalledWith(
      credentials,
      "network-1",
      "user-1",
    );
  });

  it("updates a network", async () => {
    const patch = { description: "Updated" };

    await controller.update("network-1", patch);

    expect(networksService.update).toHaveBeenCalledWith("network-1", patch);
  });

  it("deletes a network", async () => {
    await controller.delete("network-1");

    expect(networksService.delete).toHaveBeenCalledWith("network-1");
  });
});
