import type { TagColor } from "common/schemas/tag/index";

export const colorVariants: Record<
  TagColor,
  { backgroundColor: string; borderColor: string }
> = {
  red: {
    backgroundColor: "bg-red-500/25",
    borderColor: "border-red-500",
  },
  blue: {
    backgroundColor: "bg-blue-500/25",
    borderColor: "border-blue-500",
  },
  green: {
    backgroundColor: "bg-green-500/25",
    borderColor: "border-green-500",
  },
  yellow: {
    backgroundColor: "bg-yellow-500/25",
    borderColor: "border-yellow-500",
  },
  purple: {
    backgroundColor: "bg-purple-500/25",
    borderColor: "border-purple-500",
  },
  orange: {
    backgroundColor: "bg-orange-500/25",
    borderColor: "border-orange-500",
  },
};
