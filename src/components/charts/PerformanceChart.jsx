import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip,
} from 'chart.js';
import { performanceData } from '../../data/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const PERIODS = ['1M', '3M', '6M', '1A', 'MAX'];

export default function PerformanceChart() {
  const [period, setPeriod] = useState('3M');
  const d = performanceData[period];

  const data = {
    labels: d.labels,
    datasets: [
      {
        label: 'Carteira',
        data: d.carteira,
        borderColor: '#6c63ff',
        backgroundColor: 'rgba(108,99,255,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'CDI',
        data: d.cdi,
        borderColor: '#4ade80',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        borderDash: [4, 3],
      },
      {
        label: 'IBOVESPA',
        data: d.ibov,
        borderColor: '#f59e0b',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
        borderDash: [4, 3],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1e2235',
        titleColor: 'rgba(255,255,255,0.6)',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: 'rgba(255,255,255,0.35)',
          font: { size: 10 },
          callback: (v) => v.toFixed(1) + '%',
        },
      },
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Desempenho da carteira</span>
        <div style={styles.periodBtns}>
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{ ...styles.periodBtn, ...(period === p ? styles.periodBtnActive : {}) }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', height: 190 }}>
        <Line data={data} options={options} />
      </div>

      <div style={styles.legend}>
        {[
          { label: 'Carteira', color: '#6c63ff' },
          { label: 'CDI', color: '#4ade80' },
          { label: 'IBOVESPA', color: '#f59e0b' },
        ].map(({ label, color }) => (
          <span key={label} style={styles.legendItem}>
            <span style={{ ...styles.legendLine, background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#1a1d2e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    padding: 18,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
  },
  periodBtns: {
    display: 'flex',
    gap: 4,
  },
  periodBtn: {
    background: 'transparent',
    border: '0.5px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    padding: '4px 8px',
    borderRadius: 5,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
  },
  periodBtnActive: {
    background: 'rgba(108,99,255,0.25)',
    color: '#a78bfa',
    borderColor: '#6c63ff',
  },
  legend: {
    display: 'flex',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  legendLine: {
    width: 10,
    height: 3,
    borderRadius: 2,
    display: 'inline-block',
  },
};
