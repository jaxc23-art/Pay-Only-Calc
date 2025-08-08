import React from 'react';

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
};

export default function NumberInput({ label, value, onChange, step = 1 }: Props) {
  return (
    <label style={{ display: 'grid', gap: 4 }}>
      <span>{label}</span>
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value || '0'))}
        style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6, width: 200 }}
      />
    </label>
  );
}
