'use client';

import ReactSelect, { StylesConfig } from 'react-select';

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

const styles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    borderColor: state.isFocused ? '#3D006B' : '#E5E7EB',
    borderRadius: '0.5rem',
    boxShadow: state.isFocused ? '0 0 0 2px rgb(61 0 107 / 0.1)' : 'none',
    '&:hover': { borderColor: 'rgb(61 0 107 / 0.4)' },
    cursor: 'pointer',
  }),
  option: (base, state) => ({
    ...base,
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? '#3D006B' : state.isFocused ? '#F3E8FF' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    cursor: 'pointer',
  }),
  placeholder: (base) => ({ ...base, color: '#9CA3AF', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }),
  singleValue: (base) => ({ ...base, color: '#374151', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }),
  input: (base) => ({ ...base, fontFamily: 'var(--font-body)', fontSize: '0.875rem' }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export function Select({ options, value, onChange, placeholder, isClearable, isLoading, className }: SelectProps) {
  const selected = value ? options.find((o) => o.value === value) ?? null : null;

  return (
    <div className={className}>
      <ReactSelect<SelectOption, false>
        options={options}
        value={selected}
        onChange={(opt: SelectOption | null) => onChange(opt?.value ?? '')}
        placeholder={placeholder}
        isClearable={isClearable}
        isLoading={isLoading}
        styles={styles}
        noOptionsMessage={() => 'No options'}
        loadingMessage={() => 'Loading…'}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
      />
    </div>
  );
}
