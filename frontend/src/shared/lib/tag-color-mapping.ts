import type { TagColor } from "common/schemas/tag/index";

export const colorVariants: Record<
  NonNullable<TagColor>,
  { backgroundColor: string; borderColor: string; textColor: string }
> = {
  red: {
    backgroundColor: "bg-red-500/25",
    borderColor: "border-red-500",
    textColor: "text-red-700",
  },
  blue: {
    backgroundColor: "bg-blue-500/25",
    borderColor: "border-blue-500",
    textColor: "text-blue-700",
  },
  green: {
    backgroundColor: "bg-green-500/25",
    borderColor: "border-green-500",
    textColor: "text-green-700",
  },
  yellow: {
    backgroundColor: "bg-yellow-500/25",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-700",
  },
  purple: {
    backgroundColor: "bg-purple-500/25",
    borderColor: "border-purple-500",
    textColor: "text-purple-700",
  },
  orange: {
    backgroundColor: "bg-orange-500/25",
    borderColor: "border-orange-500",
    textColor: "text-orange-700",
  },
};
