import { NextResponse } from 'next/server';
import { createPublicClient, http, parseAbi, decodeEventLog, getAddress } from 'viem';
import { base } from 'viem/chains';

const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const MIN = 100000n;
const abi = parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']);
const client = createPublicClient({ chain: base, transport: http() });
// In-memory replay guard. Use Redis/Vercel KV in production (serverless instances don't share memory).
const used = new Set<string>();

export async function POST(req: Request) {
  const { text, txHash } = await req.json();
  if (!text || !/^0x[0-9a-fA-F]{64}$/.test(txHash ?? '')) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  if (used.has(txHash)) return NextResponse.json({ error: 'Payment already used' }, { status: 402 });

  const payTo = getAddress(process.env.NEXT_PUBLIC_PAY_TO!);
  let paid = false;
  try {
    const receipt = await client.waitForTransactionReceipt({ hash: txHash, timeout: 30_000 });
    if (receipt.status === 'success') {
      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== USDC.toLowerCase()) continue;
        try {
          const ev = decodeEventLog({ abi, data: log.data, topics: log.topics });
          if (getAddress(ev.args.to) === payTo && ev.args.value >= MIN) paid = true;
        } catch {}
      }
    }
  } catch {}
  if (!paid) return NextResponse.json({ error: 'Payment not verified' }, { status: 402 });
  used.add(txHash);

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: 'Rewrite the user\'s Farcaster cast into 3 sharper versions (punchy, witty, clear). Max 320 chars each. Respond ONLY with a JSON array of 3 strings.',
      messages: [{ role: 'user', content: String(text).slice(0, 320) }],
    }),
  });
  const data = await r.json();
  try {
    const versions = JSON.parse(data.content[0].text.replace(/```json|```/g, '').trim());
    return NextResponse.json({ versions });
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
