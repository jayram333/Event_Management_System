import React from 'react';

export const CardSkeleton = () => (
  <div className="event-card glass-panel" style={{ height: '220px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <div className="skeleton" style={{ height: '24px', width: '60%' }}></div>
    <div className="skeleton" style={{ height: '16px', width: '40%' }}></div>
    <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
      <div className="skeleton" style={{ height: '36px', flex: 1 }}></div>
      <div className="skeleton" style={{ height: '36px', flex: 1 }}></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="table-container glass-panel">
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: '40px', width: '100%' }}></div>
      ))}
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
    <div className="skeleton" style={{ height: '32px', width: '40%' }}></div>
    <div className="skeleton" style={{ height: '20px', width: '25%' }}></div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
      <div className="skeleton" style={{ height: '80px' }}></div>
      <div className="skeleton" style={{ height: '80px' }}></div>
      <div className="skeleton" style={{ height: '80px' }}></div>
    </div>
  </div>
);

export default CardSkeleton;
