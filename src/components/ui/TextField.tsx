"use client";

import {
  TextField as MUITextField,
  TextFieldProps as MUITextFieldProps,
  InputAdornment,
} from "@mui/material";
import { forwardRef } from "react";
import clsx from "clsx";

export interface TextFieldProps extends Omit<MUITextFieldProps, "variant"> {
  variant?: "outlined" | "filled";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperIcon?: React.ReactNode;
}

const TextField = forwardRef<HTMLDivElement, TextFieldProps>(
  (
    {
      variant = "outlined",
      leftIcon,
      rightIcon,
      helperIcon,
      className,
      InputProps,
      ...props
    },
    ref
  ) => {
    return (
      <MUITextField
        ref={ref}
        variant={variant}
        className={clsx("w-full", className)}
        InputProps={{
          ...InputProps,
          startAdornment: leftIcon ? (
            <InputAdornment position="start">{leftIcon}</InputAdornment>
          ) : (
            InputProps?.startAdornment
          ),
          endAdornment: rightIcon ? (
            <InputAdornment position="end">{rightIcon}</InputAdornment>
          ) : (
            InputProps?.endAdornment
          ),
        }}
        {...props}
      />
    );
  }
);

TextField.displayName = "TextField";

export { TextField };
