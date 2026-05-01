import * as schema from "../../db/schema";
import { NetworksService } from "./networks.service";

const createDbMock = () => ({
  delete: jest.fn(),
  insert: jest.fn(),
  query: {
    networks: {
      findFirst: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
  },
  transaction: jest.fn(),
  update: jest.fn(),
});

describe("NetworksService", () => {
  let db: ReturnType<typeof createDbMock>;
  let service: NetworksService;

  beforeEach(() => {
    db = createDbMock();
    service = new NetworksService(db as never);
  });

  it("creates a network and admin membership in one transaction", async () => {
    const network = {
      cidr: "10.0.0.0/24",
      description: "Test network",
      id: "network-1",
      name: "Test",
    };
    const returning = jest.fn().mockResolvedValue([network]);
    const insertNetworkValues = jest.fn().mockReturnValue({ returning });
    const insertMembershipValues = jest.fn().mockResolvedValue(undefined);
    const tx = {
      insert: jest
        .fn()
        .mockReturnValueOnce({ values: insertNetworkValues })
        .mockReturnValueOnce({ values: insertMembershipValues }),
    };
    db.transaction.mockImplementation((callback) => callback(tx));

    const createData = {
      cidr: "10.0.0.0/24",
      description: "Test network",
      name: "Test",
    };

    await expect(service.create(createData, "user-1")).resolves.toBe(network);

    expect(db.transaction).toHaveBeenCalledWith(expect.any(Function));
    expect(tx.insert).toHaveBeenNthCalledWith(1, schema.networks);
    expect(insertNetworkValues).toHaveBeenCalledWith(createData);
    expect(tx.insert).toHaveBeenNthCalledWith(2, schema.networkUsers);
    expect(insertMembershipValues).toHaveBeenCalledWith({
      networkId: "network-1",
      role: "admin",
      userId: "user-1",
    });
  });

  it("enters a network as a regular user", async () => {
    const values = jest.fn().mockResolvedValue(undefined);
    db.insert.mockReturnValue({ values });

    await service.enter({ key: "secret" }, "network-1", "user-1");

    expect(db.insert).toHaveBeenCalledWith(schema.networkUsers);
    expect(values).toHaveBeenCalledWith({
      networkId: "network-1",
      role: "user",
      userId: "user-1",
    });
  });

  it("reads one network by id", async () => {
    const network = { id: "network-1" };
    db.query.networks.findFirst.mockResolvedValue(network);

    await expect(service.read("network-1")).resolves.toBe(network);
    expect(db.query.networks.findFirst).toHaveBeenCalledWith({
      where: { id: "network-1" },
    });
  });

  it("returns networks for the current user", async () => {
    const networks = [{ id: "network-1" }, { id: "network-2" }];
    db.query.user.findFirst.mockResolvedValue({ networks });

    await expect(service.getMyNetworks("user-1")).resolves.toBe(networks);
    expect(db.query.user.findFirst).toHaveBeenCalledWith({
      columns: {},
      where: { id: "user-1" },
      with: { networks: true },
    });
  });

  it("returns an empty list when the user has no networks", async () => {
    db.query.user.findFirst.mockResolvedValue(undefined);

    await expect(service.getMyNetworks("user-1")).resolves.toEqual([]);
  });

  it("updates a network by id", async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const patch = { description: "Updated" };

    await service.update("network-1", patch);

    expect(db.update).toHaveBeenCalledWith(schema.networks);
    expect(set).toHaveBeenCalledWith(patch);
    expect(where).toHaveBeenCalled();
  });

  it("deletes a network by id", async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    db.delete.mockReturnValue({ where });

    await service.delete("network-1");

    expect(db.delete).toHaveBeenCalledWith(schema.networks);
    expect(where).toHaveBeenCalled();
  });
});
