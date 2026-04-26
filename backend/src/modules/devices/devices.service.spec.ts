import * as schema from "../../db/schema";
import { DevicesService } from "./devices.service";

const createDbMock = () => ({
  delete: jest.fn(),
  insert: jest.fn(),
  query: {
    devices: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
  update: jest.fn(),
});

describe("DevicesService", () => {
  let db: ReturnType<typeof createDbMock>;
  let service: DevicesService;

  beforeEach(() => {
    db = createDbMock();
    service = new DevicesService(db as never);
  });

  it("creates a device scoped to a network", async () => {
    const values = jest.fn().mockResolvedValue(undefined);
    db.insert.mockReturnValue({ values });

    const device = {
      ip: "10.0.0.2",
      name: "Laptop",
      ownerId: "user-1",
    };

    await service.create(device, "network-1");

    expect(db.insert).toHaveBeenCalledWith(schema.devices);
    expect(values).toHaveBeenCalledWith({ ...device, networkId: "network-1" });
  });

  it("reads one device with tag relations", async () => {
    const device = { id: "device-1", tags: [] };
    db.query.devices.findFirst.mockResolvedValue(device);

    await expect(service.read("network-1", "device-1")).resolves.toBe(device);

    const options = db.query.devices.findFirst.mock.calls[0][0];
    expect(options.with).toEqual({
      tags: { columns: { color: true, id: true, name: true } },
    });
    expect(options.where.RAW(schema.devices)).toBeDefined();
  });

  it("reads devices filtered by tags, owner, and search query", async () => {
    const devices = [{ id: "device-1", tags: [] }];
    db.query.devices.findMany.mockResolvedValue(devices);

    await expect(
      service.read("network-1", undefined, "backend,,ops", "user-1", "lap"),
    ).resolves.toBe(devices);

    const options = db.query.devices.findMany.mock.calls[0][0];
    const desc = jest.fn().mockReturnValue("ordered-by-similarity");

    expect(options.with).toEqual({
      tags: { columns: { color: true, id: true, name: true } },
    });
    expect(options.where.RAW(schema.devices)).toBeDefined();
    expect(options.orderBy(schema.devices, { desc })).toBe(
      "ordered-by-similarity",
    );
    expect(desc).toHaveBeenCalledWith(expect.anything());
  });

  it("reads devices without search ordering when no query is provided", async () => {
    const devices = [{ id: "device-1", tags: [] }];
    db.query.devices.findMany.mockResolvedValue(devices);

    await expect(service.read("network-1")).resolves.toBe(devices);

    const options = db.query.devices.findMany.mock.calls[0][0];
    expect(options.where.RAW(schema.devices)).toBeDefined();
    expect(options.orderBy).toBeUndefined();
  });

  it("updates a device within a network", async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const patch = { name: "Workstation" };

    await service.update("device-1", "network-1", patch);

    expect(db.update).toHaveBeenCalledWith(schema.devices);
    expect(set).toHaveBeenCalledWith(patch);
    expect(where).toHaveBeenCalled();
  });

  it("deletes a device by id", async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    db.delete.mockReturnValue({ where });

    await service.delete("device-1");

    expect(db.delete).toHaveBeenCalledWith(schema.devices);
    expect(where).toHaveBeenCalled();
  });
});
