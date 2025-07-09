import SlotMachine from '../components/SlotMachine';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>
          Responsible Gambling Simulator | Educational Demo
        </title>
        <meta
          name="description"
          content="An educational slot machine simulator demonstrating responsible gambling practices. No real money involved."
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <meta
          name="keywords"
          content="gambling simulator, educational game, slot machine, responsible gambling"
        />
        <meta
          property="og:title"
          content="Responsible Gambling Simulator"
        />
        <meta
          property="og:description"
          content="An educational slot machine simulator demonstrating responsible gambling practices."
        />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Gambling Simulator" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Responsible Gambling Simulator"
        />
        <meta
          name="twitter:description"
          content="An educational slot machine simulator demonstrating responsible gambling practices."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8">
        <SlotMachine />
      </div>
    </>
  );
}
