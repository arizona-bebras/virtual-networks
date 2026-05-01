import * as schema from "../../db/schema";
import { RulesService } from "./rules.service";

const createDbMock = () => ({
  delete: jest.fn(),
  insert: jest.fn(),
  query: {
    rules: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
  update: jest.fn(),
});

describe("RulesService", () => {
  let db: ReturnType<typeof createDbMock>;
  let service: RulesService;

  beforeEach(() => {
    db = createDbMock();
    service = new RulesService(db as never);
  });

  it("creates a rule scoped to a network", async () => {
    const values = jest.fn().mockResolvedValue(undefined);
    db.insert.mockReturnValue({ values });

    const rule = { dest: "tag-2", port: 443, protocol: "tcp", source: "tag-1" };

    await service.create(rule, "network-1");

    expect(db.insert).toHaveBeenCalledWith(schema.rules);
    expect(values).toHaveBeenCalledWith({ ...rule, networkId: "network-1" });
  });

  it("reads one rule by id", async () => {
    const rule = { id: "rule-1" };
    db.query.rules.findFirst.mockResolvedValue(rule);

    await expect(service.get("rule-1")).resolves.toBe(rule);
    expect(db.query.rules.findFirst).toHaveBeenCalledWith({
      where: { id: "rule-1" },
    });
  });

  it("reads all rules for a network", async () => {
    const rules = [{ id: "rule-1" }, { id: "rule-2" }];
    db.query.rules.findMany.mockResolvedValue(rules);

    await expect(service.getAllRules("network-1")).resolves.toBe(rules);
    expect(db.query.rules.findMany).toHaveBeenCalledWith({
      where: { networkId: "network-1" },
    });
  });

  it("updates a rule by id", async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    const set = jest.fn().mockReturnValue({ where });
    db.update.mockReturnValue({ set });

    const patch = { port: 8443 };

    await service.update("rule-1", patch);

    expect(db.update).toHaveBeenCalledWith(schema.rules);
    expect(set).toHaveBeenCalledWith(patch);
    expect(where).toHaveBeenCalled();
  });

  it("deletes a rule by id", async () => {
    const where = jest.fn().mockResolvedValue(undefined);
    db.delete.mockReturnValue({ where });

    await service.delete("rule-1");

    expect(db.delete).toHaveBeenCalledWith(schema.rules);
    expect(where).toHaveBeenCalled();
  });
});
