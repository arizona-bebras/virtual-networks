import { BadRequestException, NotFoundException } from "@nestjs/common";
import { asc as drizzleAsc, type SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import * as schema from "../../db/schema";
import { DevicesService } from "./devices.service";

const dialect = new PgDialect();

const renderSql = (query: SQL) => {
  const rendered = dialect.sqlToQuery(query);

  return {
    params: rendered.params,
    sql: rendered.sql.replace(/\s+/g, " ").trim(),
  };
};

const createDbMock = () => ({
  delete: jest.fn(),
  insert: jest.fn(),
  query: {
    devices: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    tags: {
      findFirst: jest.fn(),
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
    expect(renderSql(options.where.RAW(schema.devices))).toEqual({
      params: ["network-1", "device-1"],
      sql: '(("devices"."network_id" = $1) and ("devices"."id" = $2))',
    });
  });

  it("reads devices filtered by tags, owner, and search query", async () => {
    const devices = [{ id: "device-1", tags: [] }];
    db.query.devices.findMany.mockResolvedValue(devices);

    await expect(
      service.read("network-1", undefined, ["backend", "ops"], "user-1", "lap"),
    ).resolves.toBe(devices);

    const options = db.query.devices.findMany.mock.calls[0][0];
    const asc = jest.fn().mockReturnValue("ordered-by-similarity");

    expect(options.with).toEqual({
      tags: { columns: { color: true, id: true, name: true } },
    });
    expect(renderSql(options.where.RAW(schema.devices))).toEqual({
      params: ["network-1", "network-1", "backend", "ops", "user-1", "lap%"],
      sql: '(("devices"."network_id" = $1) and (exists ( select 1 from "devices_tags" inner join "tags" on "devices_tags"."tag_id" = "tags"."id" where "devices_tags"."device_id" = "devices"."id" and "tags"."network_id" = $2 and "tags"."id" in ($3, $4) )) and ("devices"."owner_id" = $5) and ("devices"."name" ilike $6))',
    });
    expect(options.orderBy(schema.devices, { asc })).toBe(
      "ordered-by-similarity",
    );
    expect(asc).toHaveBeenCalledWith(expect.anything());
    expect(
      renderSql(options.orderBy(schema.devices, { asc: drizzleAsc })),
    ).toEqual({
      params: [],
      sql: 'length("devices"."name") asc',
    });
  });

  it("reads devices without search ordering when no query is provided", async () => {
    const devices = [{ id: "device-1", tags: [] }];
    db.query.devices.findMany.mockResolvedValue(devices);

    await expect(service.read("network-1")).resolves.toBe(devices);

    const options = db.query.devices.findMany.mock.calls[0][0];
    expect(renderSql(options.where.RAW(schema.devices))).toEqual({
      params: ["network-1"],
      sql: '"devices"."network_id" = $1',
    });
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
    expect(renderSql(where.mock.calls[0][0])).toEqual({
      params: ["device-1", "network-1"],
      sql: '(("devices"."id" = $1) and ("devices"."network_id" = $2))',
    });
  });

  it("deletes a device by id", async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    db.delete.mockReturnValue({ where });

    await service.delete("device-1");

    expect(db.delete).toHaveBeenCalledWith(schema.devices);
    expect(renderSql(where.mock.calls[0][0])).toEqual({
      params: ["device-1"],
      sql: '"devices"."id" = $1',
    });
  });

  it("adds a tag to a device in the same network", async () => {
    const values = jest.fn().mockResolvedValue(undefined);
    db.insert.mockReturnValue({ values });
    db.query.tags.findFirst.mockResolvedValue({
      id: "tag-1",
      networkId: "network-1",
    });
    db.query.devices.findFirst.mockResolvedValue({
      id: "device-1",
      networkId: "network-1",
    });

    await service.addTag("device-1", "tag-1");

    expect(db.query.tags.findFirst).toHaveBeenCalledWith({
      where: { id: "tag-1" },
    });
    expect(db.query.devices.findFirst).toHaveBeenCalledWith({
      where: { id: "device-1" },
    });
    expect(db.insert).toHaveBeenCalledWith(schema.devicesTags);
    expect(values).toHaveBeenCalledWith({
      deviceId: "device-1",
      tagId: "tag-1",
    });
  });

  it("rejects adding a missing tag to a device", async () => {
    db.query.tags.findFirst.mockResolvedValue(undefined);

    await expect(service.addTag("device-1", "tag-1")).rejects.toThrow(
      NotFoundException,
    );

    expect(db.query.tags.findFirst).toHaveBeenCalledWith({
      where: { id: "tag-1" },
    });
    expect(db.query.devices.findFirst).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("rejects adding a tag to a missing device", async () => {
    db.query.tags.findFirst.mockResolvedValue({
      id: "tag-1",
      networkId: "network-1",
    });
    db.query.devices.findFirst.mockResolvedValue(undefined);

    await expect(service.addTag("device-1", "tag-1")).rejects.toThrow(
      NotFoundException,
    );

    expect(db.query.devices.findFirst).toHaveBeenCalledWith({
      where: { id: "device-1" },
    });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it("rejects adding a tag from another network", async () => {
    db.query.tags.findFirst.mockResolvedValue({
      id: "tag-1",
      networkId: "network-1",
    });
    db.query.devices.findFirst.mockResolvedValue({
      id: "device-1",
      networkId: "network-2",
    });

    await expect(service.addTag("device-1", "tag-1")).rejects.toThrow(
      BadRequestException,
    );

    expect(db.insert).not.toHaveBeenCalled();
  });

  it("deletes a tag from a device", async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    db.delete.mockReturnValue({ where });

    await service.deleteTag("device-1", "tag-1");

    expect(db.delete).toHaveBeenCalledWith(schema.devicesTags);
    expect(renderSql(where.mock.calls[0][0])).toEqual({
      params: ["device-1", "tag-1"],
      sql: '(("devices_tags"."device_id" = $1) and ("devices_tags"."tag_id" = $2))',
    });
  });
});
