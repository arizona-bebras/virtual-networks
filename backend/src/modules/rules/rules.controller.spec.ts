import { RulesController } from "./rules.controller";

const createRulesServiceMock = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAllRules: jest.fn(),
  update: jest.fn(),
});

describe("RulesController", () => {
  let controller: RulesController;
  let rulesService: ReturnType<typeof createRulesServiceMock>;

  beforeEach(() => {
    rulesService = createRulesServiceMock();
    controller = new RulesController(rulesService as never);
  });

  it("creates a rule scoped to a network", async () => {
    const rule = { port: 443, protocol: "tcp" };

    await controller.create("network-1", rule);

    expect(rulesService.create).toHaveBeenCalledWith(rule, "network-1");
  });

  it("returns all rules for a network", async () => {
    const rules = [{ id: "rule-1" }];
    rulesService.getAllRules.mockResolvedValue(rules);

    await expect(controller.getAllRules("network-1")).resolves.toBe(rules);
    expect(rulesService.getAllRules).toHaveBeenCalledWith("network-1");
  });

  it("returns a rule by id", async () => {
    const rule = { id: "rule-1" };
    rulesService.get.mockResolvedValue(rule);

    await expect(controller.get("rule-1")).resolves.toBe(rule);
    expect(rulesService.get).toHaveBeenCalledWith("rule-1");
  });

  it("updates a rule", async () => {
    const patch = { port: 8443 };

    await controller.update("rule-1", patch);

    expect(rulesService.update).toHaveBeenCalledWith("rule-1", patch);
  });

  it("deletes a rule", async () => {
    await controller.delete("rule-1");

    expect(rulesService.delete).toHaveBeenCalledWith("rule-1");
  });
});
