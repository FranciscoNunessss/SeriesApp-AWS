import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-slate-700 bg-slate-800 text-slate-300",
        destructive:
          "border-red-500/30 bg-red-500/15 text-red-400",
        outline:
          "border-slate-700 text-slate-300",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
        info:
          "border-blue-500/30 bg-blue-500/15 text-blue-400",
        danger:
          "border-red-500/30 bg-red-500/15 text-red-400",
        warning:
          "border-amber-500/30 bg-amber-500/15 text-amber-400",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
