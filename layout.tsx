export const metadata = {
  title: 'Cast Polisher',
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/embed.png`,
      button: {
        title: 'Polish my cast',
        action: { type: 'launch_miniapp', name: 'Cast Polisher', url: process.env.NEXT_PUBLIC_APP_URL },
      },
    }),
  },
};
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#0f0b1a', color: '#f2eefc', fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
