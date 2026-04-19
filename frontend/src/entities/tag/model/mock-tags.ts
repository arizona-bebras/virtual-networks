import {
  Briefcase,
  Database,
  Globe,
  Laptop,
  Server,
  Shield,
} from "@lucide/svelte";
import type { Tag } from "./types.js";

export const initialTags: Tag[] = [
  { id: "1", name: "Servers", icon: Server, color: "blue", count: 12 },
  { id: "2", name: "IT", icon: Briefcase, color: "green", count: 5 },
  { id: "3", name: "Laptop", icon: Laptop, color: "orange", count: 8 },
  { id: "4", name: "Production", icon: Database, color: "red", count: 15 },
  { id: "5", name: "Web", icon: Globe, color: "purple", count: 10 },
  { id: "6", name: "Security", icon: Shield, color: "yellow", count: 3 },
];
