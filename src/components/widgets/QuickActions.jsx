import React from 'react';
import { Plus, ArrowUp, TrendingUp, TrendingDown } from 'lucide-react';

const ACTIONS = [
  { label: 'Depositar', icon: Plus,         primary: true },
  { label: 'Sacar',     icon: ArrowUp,      primary: false },
  { label: 'Comprar',   icon: TrendingUp,   primary: false },
  { label: 'Vender',    icon: TrendingDown, primary: false },
];

export default function QuickActions({ onAction }) {
  return (
    <div style={styles.row}>
      {ACTIONS.map(({ label, icon: Icon, primary }) => (
        <button
          key={label}
          onClick={() => onAction?.(label)}
          style={{ ...styles.btn, ...(primary ? styles.primary : {}) }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    gap: 10,
  },
  btn: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    padding: 11,
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primary: {
    background: '#6c63ff',
    borderColor: '#6c63ff',
    color: '#fff',
  },
};
