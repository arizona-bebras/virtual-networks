import type { DeviceRelations } from "common/schemas/device/index";
import { createContext } from "svelte";

export const [getDeviceEdit, setDeviceEdit] = createContext<{
  open: (device: DeviceRelations) => void;
}>();
