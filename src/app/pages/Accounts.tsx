import { useEffect } from 'react';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';

export function Accounts() {
  const { paymentMethods, reloadPaymentMethods } = usePaymentMethods();

  useEffect(() => {
    const handler = () => void reloadPaymentMethods();
    window.addEventListener('account-saved', handler);
    return () => window.removeEventListener('account-saved', handler);
  }, [reloadPaymentMethods]);

  return (
    <div style={{ padding: '1.5rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Accounts</h2>
      {paymentMethods.length === 0 ? (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem 0' }}>No accounts yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {paymentMethods.map(pm => (
            <div
              key={pm.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'var(--surface)',
                padding: '1rem',
                borderRadius: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  background: pm.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0,
                }}
              >
                {pm.icon}
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{pm.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  {pm.description || pm.type.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
