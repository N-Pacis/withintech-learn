"use client";

import ReactSelect, { StylesConfig } from "react-select";
import { useTheme } from "@/providers/ThemeProvider";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  isClearable?: boolean;
  isLoading?: boolean;
  className?: string;
}

function useSelectStyles(): StylesConfig<SelectOption, false> {
  const { theme } = useTheme();
  const dark = theme === "dark";

  return {
    control: (base, state) => ({
      ...base,
      fontFamily: "var(--font-body)",
      fontSize: "0.875rem",
      backgroundColor: dark ? "#1a1a1a" : "white",
      borderColor: state.isFocused
        ? dark
          ? "#7C3AED"
          : "#3D006B"
        : dark
          ? "#2d2d2d"
          : "#E5E7EB",
      borderRadius: "0.5rem",
      boxShadow: state.isFocused
        ? `0 0 0 2px ${dark ? "rgb(124 58 237 / 0.15)" : "rgb(61 0 107 / 0.1)"}`
        : "none",
      "&:hover": {
        borderColor: dark ? "rgb(124 58 237 / 0.5)" : "rgb(61 0 107 / 0.4)",
      },
      cursor: "pointer",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: dark ? "#1a1a1a" : "white",
      border: `1px solid ${dark ? "#2d2d2d" : "#E5E7EB"}`,
      boxShadow: dark
        ? "0 4px 16px rgb(0 0 0 / 0.4)"
        : "0 4px 16px rgb(0 0 0 / 0.1)",
    }),
    option: (base, state) => ({
      ...base,
      fontFamily: "var(--font-body)",
      fontSize: "0.875rem",
      backgroundColor: state.isSelected
        ? "#3D006B"
        : state.isFocused
          ? dark
            ? "#2d1a4a"
            : "#F3E8FF"
          : "transparent",
      color: state.isSelected ? "white" : dark ? "#D1D5DB" : "#374151",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: dark ? "#6B7280" : "#9CA3AF",
      fontFamily: "var(--font-body)",
      fontSize: "0.875rem",
    }),
    singleValue: (base) => ({
      ...base,
      color: dark ? "#F9FAFB" : "#374151",
      fontFamily: "var(--font-body)",
      fontSize: "0.875rem",
    }),
    input: (base) => ({
      ...base,
      color: dark ? "#F9FAFB" : "#374151",
      fontFamily: "var(--font-body)",
      fontSize: "0.875rem",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    indicatorsContainer: (base) => ({
      ...base,
      color: dark ? "#9CA3AF" : "#6B7280",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: dark ? "#9CA3AF" : "#6B7280",
    }),
    clearIndicator: (base) => ({
      ...base,
      color: dark ? "#9CA3AF" : "#6B7280",
    }),
  };
}

export function Select({
  options,
  value,
  onChange,
  placeholder,
  isClearable,
  isLoading,
  className,
}: SelectProps) {
  const styles = useSelectStyles();
  const selected = value
    ? (options.find((o) => o.value === value) ?? null)
    : null;

  return (
    <div className={className}>
      <ReactSelect<SelectOption, false>
        options={options}
        value={selected}
        onChange={(opt: SelectOption | null) => onChange(opt?.value ?? "")}
        placeholder={placeholder}
        isClearable={isClearable}
        isLoading={isLoading}
        styles={styles}
        noOptionsMessage={() => "No options"}
        loadingMessage={() => "Loading…"}
        menuPortalTarget={
          typeof document !== "undefined" ? document.body : undefined
        }
      />
    </div>
  );
}
