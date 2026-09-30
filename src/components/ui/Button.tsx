import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_24px_rgba(255,255,255,0.12)]",
  secondary:
    "bg-zinc-900 text-zinc-100 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800",
  ghost: "text-zinc-400 hover:text-white hover:bg-zinc-900",
  outline:
    "border border-zinc-700 text-zinc-100 hover:border-zinc-500 hover:bg-zinc-900/60",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
