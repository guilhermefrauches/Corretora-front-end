import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { allocationData } from '../../data/mockData';

ChartJS.register(ArcElement, Tooltip);

export default function AllocationDonut() {
  const data = {
    labels: allocationData.map((d) => d.label),
    datasets: [{
      data: allocationData.map((d) => d.pct),
      backgroundColor: allocationData.map((d) => d.color),
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e2235',
        titleColor: 'rgba(255,255,255,0.6)',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.title}>Alocação</div>

      <div style={styles.donutWrap}>
        <Doughnut data={data} options={options} />
        <div style={styles.center}>
          <div style={styles.centerValue}>87k</div>
          <div style={styles.centerLabel}>total</div>
        </div>
      </div>

      <div style={styles.legend}>
        {allocationData.map(({ label, pct, color }) => (
          <div key={label} style={styles.legendItem}>
            <div style={styles.legendLeft}>
              <div style={{ ...styles.dot, background: color }} />
              <span>{label}</span>
            </div>
            <span style={styles.pct}>{pct}%</span>
          </div>
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
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  donutWrap: {
    position: 'relative',
    height: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  centerValue: {
    fontSize: 18,
    fontWeight: 500,
    color: '#fff',
  },
  centerLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  legend: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
  },
  legendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'rgba(255,255,255,0.65)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  pct: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
  },
};
