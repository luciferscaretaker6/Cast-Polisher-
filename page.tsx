'use client';
import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

const USDC = 'eip155:8453/erc20:0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const PRICE = '100000'; // 0.10 USDC (6 decimals)

export default function Home() {
  const [text, setText] = useState('');
  const [out, setOut] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => { sdk.actions.ready(); }, []);

  async function run() {
    setBusy(true); setErr(''); setOut([]);
    try {
      const pay: any = await sdk.actions.sendToken({
        token: USDC,
        amount: PRICE,
        recipientAddress: process.env.NEXT_PUBLIC_PAY_TO!,
      });
      if (!pay?.success) throw new Error('Payment cancelled');
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, txHash: pay.send.transaction }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setOut(data.versions);
    } catch (e: any) { setErr(e.message); }
    setBusy(false);
  }

  return (
    <main style={{ padding: 20, maxWidth: 480, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Cast Polisher</h2>
      <p style={{ opacity: .7, marginTop: -8 }}>3 sharper versions of your draft. 0.10 USDC.</p>
      <textarea value={text} onChange={e => setText(e.target.value)} maxLength={320} rows={5}
        placeholder="Paste your draft cast…"
        style={{ width: '100%', boxSizing: 'border-box', padding: 12, borderRadius: 12, border: '1px solid #3b2f63', background: '#1a1330', color: 'inherit', fontSize: 16 }} />
      <button onClick={run} disabled={busy || !text.trim()}
        style={{ width: '100%', marginTop: 12, padding: 14, borderRadius: 12, border: 0, background: '#8a63d2', color: '#fff', fontSize: 16, fontWeight: 600, opacity: busy || !text.trim() ? .5 : 1 }}>
        {busy ? 'Working…' : 'Polish for 0.10 USDC'}
      </button>
      {err && <p style={{ color: '#ff8a8a' }}>{err}</p>}
      {out.map((v, i) => (
        <div key={i} style={{ marginTop: 12, padding: 12, borderRadius: 12, background: '#1a1330' }}>
          <p style={{ margin: '0 0 8px' }}>{v}</p>
          <button onClick={() => sdk.actions.composeCast({ text: v })}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #8a63d2', background: 'transparent', color: '#cdb8ff' }}>
            Cast this
          </button>
        </div>
      ))}
    </main>
  );
}
