import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/src/lib/cn";

const badgeVariants = cva("badge", {
  variants: {
    kind: {
      pass: "badge-pass",
      reject: "badge-reject",
      unknown: "badge-unknown",
      synthetic: "badge-synthetic",
    },
  },
  defaultVariants: { kind: "unknown" },
});

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, kind, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ kind }), className)} {...props} />;
}
