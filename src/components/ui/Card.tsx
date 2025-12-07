"use client";

import { Card as MUICard, CardProps as MUICardProps } from "@mui/material";
import { forwardRef } from "react";
import clsx from "clsx";

export interface CardProps extends MUICardProps {
  variant?: "elevated" | "outlined" | "flat";
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "elevated", hoverable = false, className, children, ...props }, ref) => {
    return (
      <MUICard
        ref={ref}
        variant={variant === "outlined" ? "outlined" : "elevation"}
        elevation={variant === "flat" ? 0 : variant === "elevated" ? 1 : 0}
        className={clsx(
          "rounded-lg",
          hoverable && "transition-shadow duration-200 hover:shadow-dropdown cursor-pointer",
          variant === "flat" && "bg-grey-50 dark:bg-grey-800",
          className
        )}
        {...props}
      >
        {children}
      </MUICard>
    );
  }
);

Card.displayName = "Card";

export { Card };
