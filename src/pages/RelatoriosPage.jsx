import React from 'react';
import { FileText, Download } from 'lucide-react';
import { reports } from '../data/mockData';

const TYPE_COLORS = {
  IR: { bg: 'rgba(108,99,255,0.15)', color: '#a78bfa' },
  Extrato: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80' },
  Corretagem: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
  Performance: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa' },
};

export default function RelatoriosPage() {
  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Relatórios</div>

      <div style={styles.card}>
        {reports.map((doc, i) => {
          const colors = TYPE_COLORS[doc.type] || TYPE_COLORS.Extrato;
          return (
            <div key={i} style={{ ...styles.row, ...(i === 0 ? {} : styles.rowBorder) }}>
              <div style={styles.left}>
                <div style={styles.docIcon}>
                  <FileText size={16} color="#a78bfa" />
                </div>
                <div>
                  <div style={styles.docName}>{doc.name}</div>
                  <div style={styles.docMeta}>{doc.date} · {doc.size}</div>
                </div>
              </div>
              <div style={styles.right}>
                <span style={{ ...styles.typeBadge, background: colors.bg, color: colors.color }}>
                  {doc.type}
                </span>
                <button style={styles.downloadBtn} onClick={() => {}}>
                  <Download size={13} />
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 20 },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#fff' },
  card: {
    background: '#1a1d2e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    padding: '4px 0',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
  },
  rowBorder: { borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: 'rgba(108,99,255,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docName: { fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 3 },
  docMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  right: { display: 'flex', alignItems: 'center', gap: 10 },
  typeBadge: {
    display: 'inline-block',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.3px',
  },
  downloadBtn: {
    background: 'rgba(108,99,255,0.15)',
    border: '0.5px solid rgba(108,99,255,0.4)',
    borderRadius: 8,
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontFamily: 'inherit',
  },
};
