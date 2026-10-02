# Cast Polisher: pay-per-use Farcaster mini app

Users pay 0.10 USDC on Base per use. The server verifies the on-chain transfer before running the AI rewrite.

## Deploy
1. `npm install`, copy `.env.example` to `.env.local`, fill in all three values.
2. Deploy to Vercel (add the same env vars). Add `icon.png` (1024x1024), `splash.png`, `embed.png` (3:2) to `/public`.
3. Open the Farcaster Mini App manifest tool (Warpcast > Settings > Developer > Domains), enter your domain, sign, and paste the generated `accountAssociation` into `public/.well-known/farcaster.json`. Redeploy.
4. Test in the Warpcast developer preview, then share your app URL in a cast.

## Before launch
- Replace the in-memory `used` Set with Redis / Vercel KV.
- Check the current `sendToken` signature in the Mini Apps SDK docs; it has changed between versions.
- Margin: AI cost per call is roughly a cent or two vs 0.10 USDC revenue. Watch your API bill.
- Revenue comes from distribution: cast about it, post example outputs, ask for recasts.
