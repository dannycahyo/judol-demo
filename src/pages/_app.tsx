import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { GameProvider } from '../context/GameContext';
import { Analytics } from '@vercel/analytics/next';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GameProvider>
      <Component {...pageProps} />
      <Analytics />
    </GameProvider>
  );
}
