import { NotFoundException } from "@nestjs/common";
import { DevicesController } from "./devices.controller";

const createDevicesServiceMock = () => ({
  create: jest.fn(),
  delete: jest.fn(),
  read: jest.fn(),
  update: jest.fn(),
});

describe("DevicesController", () => {
  let controller: DevicesController;
  let devicesService: ReturnType<typeof createDevicesServiceMock>;

  beforeEach(() => {
    devicesService = createDevicesServiceMock();
    controller = new DevicesController(devicesService as never);
  });

  it("creates a device for the current user", async () => {
    const device = { ip: "10.0.0.2", name: "Laptop" };
    const session = { user: { id: "user-1" } };

    await controller.createDevice("network-1", device, session as never);

    expect(devicesService.create).toHaveBeenCalledWith(
      { ...device, ownerId: "user-1" },
      "network-1",
    );
  });

  it("gets devices with query filters", async () => {
    const devices = [{ id: "device-1" }];
    devicesService.read.mockResolvedValue(devices);

    await expect(
      controller.getDevicesWithFilters("network-1", "lap", "backend", "user-1"),
    ).resolves.toBe(devices);

    expect(devicesService.read).toHaveBeenCalledWith(
      "network-1",
      undefined,
      "backend",
      "user-1",
      "lap",
    );
  });

  it("returns a device when it exists", async () => {
    const device = { id: "device-1" };
    devicesService.read.mockResolvedValue(device);

    await expect(controller.getDevice("network-1", "device-1")).resolves.toBe(
      device,
    );
    expect(devicesService.read).toHaveBeenCalledWith("network-1", "device-1");
  });

  it("throws not found when a device does not exist", async () => {
    devicesService.read.mockResolvedValue(undefined);

    await expect(controller.getDevice("network-1", "missing")).rejects.toThrow(
      NotFoundException,
    );
  });

  it("updates a device", async () => {
    const patch = { name: "Workstation" };

    await controller.updateDevice("network-1", "device-1", patch);

    expect(devicesService.update).toHaveBeenCalledWith(
      "device-1",
      "network-1",
      patch,
    );
  });

  it("deletes a device", async () => {
    await controller.deleteDevice("device-1");

    expect(devicesService.delete).toHaveBeenCalledWith("device-1");
  });
});
