import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { GameProvider } from '../context/GameContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GameProvider>
      <Component {...pageProps} />
    </GameProvider>
  );
}
