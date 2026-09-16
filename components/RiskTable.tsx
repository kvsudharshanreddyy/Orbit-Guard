'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClosestApproachResult, RiskLevel } from '../lib/types';

const RISK_COLORS: Record<RiskLevel, string> = {
  CRITICAL: '#ff2d55',
  HIGH: '#ff9500',
  MODERATE: '#ffd60a',
  LOW: '#30d158',
};

interface RiskTableProps {
  results: ClosestApproachResult[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenModal: (result: ClosestApproachResult) => void;
  onIntercept: (id: string) => void;
  riskFilter: 'ALL' | 'HIGH+' | 'CRITICAL';
}

function TMinusTimer({ targetDate }: { targetDate: Date }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setDisplay('T+00:00');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 0) {
        setDisplay(`T-${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      } else {
        setDisplay(`T-${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return <span>{display}</span>;
}

export default function RiskTable({
  results,
  selectedId,
  onSelect,
  onOpenModal,
  onIntercept,
  riskFilter,
}: RiskTableProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = results.filter((r) => {
    if (riskFilter === 'CRITICAL') return r.riskLevel === 'CRITICAL';
    if (riskFilter === 'HIGH+')
      return r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH';
    return true;
  });

  return (
    <div className="glass-card" style={{ padding: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 'clamp(280px, 38vh, 480px)' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 12,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.1em',
          }}
        >
          PROXIMITY ALERTS
        </span>
        <span
          style={{
            background: 'rgba(0,212,255,0.15)',
            border: '1px solid rgba(0,212,255,0.3)',
            borderRadius: 9999,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: '#00d4ff',
            padding: '2px 8px',
          }}
        >
          {filtered.length}
        </span>
      </div>

      {/* Column Headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 45px 55px 65px 85px',
          gap: 6,
          padding: '0 6px 8px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: 4,
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
          }}
        >
          OBJECT
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            textAlign: 'right',
          }}
        >
          DIST
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            textAlign: 'right',
          }}
        >
          T-MINUS
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 9,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.1em',
            textAlign: 'center',
          }}
        >
          RISK
        </span>
        <span />
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 2, minHeight: 0 }}>
        <AnimatePresence>
          {filtered.map((result, i) => {
            const color = RISK_COLORS[result.riskLevel];
            const isSelected = selectedId === result.debrisId;
            const isHovered = hoveredId === result.debrisId;

            return (
              <motion.div
                key={result.debrisId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) 45px 55px 65px 85px',
                  gap: 6,
                  padding: '7px 6px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  borderLeft: isSelected || isHovered ? `2px solid ${color}` : '2px solid transparent',
                  background:
                    isSelected
                      ? `rgba(${color === '#ff2d55' ? '255,45,85' : color === '#ff9500' ? '255,149,0' : '0,212,255'},0.1)`
                      : isHovered
                      ? 'rgba(255,255,255,0.04)'
                      : (result.riskLevel === 'CRITICAL' ? 'rgba(255,45,85,0.05)' : 'transparent'),
                  transition: 'background 0.15s ease',
                  alignItems: 'center',
                  marginBottom: 2,
                  animation: result.riskLevel === 'CRITICAL' && !isSelected && !isHovered ? 'pulse-row-critical 1.5s ease-in-out infinite' : 'none',
                }}
                onMouseEnter={() => setHoveredId(result.debrisId)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  onSelect(result.debrisId);
                  onOpenModal(result);
                }}
              >
                {/* Name */}
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      color: '#ffffff',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={result.debrisName}
                  >
                    {result.debrisName}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 8.5,
                      color: 'rgba(255,255,255,0.35)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {result.objectType}
                  </div>
                  {result.riskLevel === 'CRITICAL' && (
                    <div style={{ fontSize: 7, color: '#ff2d55', marginTop: 3, fontWeight: 600, whiteSpace: 'nowrap', opacity: 0.8 }}>
                      Click row for details or Intercept ➔
                    </div>
                  )}
                </div>

                {/* Distance */}
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: '#ffffff',
                    fontWeight: 600,
                    textAlign: 'right',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {result.minDistance_km.toFixed(1)}
                  <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>km</span>
                </div>

                {/* T-Minus */}
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9.5,
                    color: 'rgba(255,255,255,0.65)',
                    textAlign: 'right',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <TMinusTimer targetDate={result.timeOfClosestApproach} />
                </div>

                {/* Risk badge */}
                <div style={{ display: 'flex', justifyContent: 'center', minWidth: 0 }}>
                  <span
                    className={`risk-badge ${result.riskLevel}`}
                    style={{
                      padding: '2px 5px',
                      fontSize: 8,
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap',
                      ...(result.riskLevel === 'CRITICAL'
                        ? { animation: 'pulse-glow-critical 2s ease-in-out infinite' }
                        : {}),
                    }}
                  >
                    {result.riskLevel === 'CRITICAL' && '⬤ '}
                    {result.riskLevel}
                  </span>
                </div>

                {/* Action button */}
                <div style={{ display: 'flex', justifyContent: 'center', minWidth: 0 }}>
                  {(result.riskLevel === 'CRITICAL' || result.riskLevel === 'HIGH') ? (
                    <button
                      style={{
                        padding: '3px 4px',
                        fontSize: 7.5,
                        borderRadius: 4,
                        letterSpacing: '0.02em',
                        border: '1px solid rgba(255, 45, 85, 0.8)',
                        background: 'rgba(255, 45, 85, 0.15)',
                        color: '#ff2d55',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 0 8px rgba(255, 45, 85, 0.4)',
                        width: '100%',
                        textAlign: 'center',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(result.debrisId);
                        onIntercept(result.debrisId);
                      }}
                    >
                      ⚠ INTERCEPT
                    </button>
                  ) : (
                    <button
                      className="btn-cyan"
                      style={{
                        padding: '2px 4px',
                        fontSize: 8,
                        borderRadius: 4,
                        letterSpacing: '0.02em',
                        opacity: isHovered || isSelected ? 1 : 0.35,
                        transition: 'opacity 0.15s ease',
                        borderWidth: '1px',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'center',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(result.debrisId);
                        onOpenModal(result);
                      }}
                    >
                      {isSelected ? 'ON' : 'TRACK'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            No objects match current filter
          </div>
        )}
      </div>
    </div>
  );
}
