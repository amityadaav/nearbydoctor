import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      as: Component = "button",
      variant = "primary",
      size = "md",
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-lg font-medium transition-colors";

    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-5 py-3",
    };

    return (
      <Component
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Button.displayName = "Button";

export default Button;