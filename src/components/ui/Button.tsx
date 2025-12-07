"use client";

import { Button as MUIButton, ButtonProps as MUIButtonProps, CircularProgress } from "@mui/material";
import { forwardRef } from "react";
import clsx from "clsx";

export interface ButtonProps extends Omit<MUIButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "text";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      className,
      ...props
    },
    ref
  ) => {
    // Map our variants to MUI variants and colors
    const getMUIVariant = (): MUIButtonProps["variant"] => {
      switch (variant) {
        case "primary":
        case "secondary":
          return "contained";
        case "outline":
          return "outlined";
        case "ghost":
        case "text":
          return "text";
        default:
          return "contained";
      }
    };

    const getMUIColor = (): MUIButtonProps["color"] => {
      switch (variant) {
        case "primary":
          return "primary";
        case "secondary":
          return "secondary";
        default:
          return "primary";
      }
    };

    return (
      <MUIButton
        ref={ref}
        variant={getMUIVariant()}
        color={getMUIColor()}
        disabled={disabled || isLoading}
        className={clsx(
          "font-medium transition-all duration-200",
          variant === "outline" && "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
          variant === "ghost" && "hover:bg-grey-100",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <CircularProgress size={20} color="inherit" className="mr-2" />
        ) : leftIcon ? (
          <span className="mr-2 flex items-center">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && (
          <span className="ml-2 flex items-center">{rightIcon}</span>
        )}
      </MUIButton>
    );
  }
);

Button.displayName = "Button";

export { Button };
