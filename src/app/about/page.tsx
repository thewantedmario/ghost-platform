import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-12">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tighter">About Ghost Platform</h1>
          <p className="text-zinc-400 text-xl leading-relaxed">
            Ghost Platform is an autonomous utility hub designed to provide developers, creators, and power users with the fastest, most reliable web tools on the internet.
          </p>
        </header>

        <section className="grid gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-500">The Mission</h2>
            <p className="text-zinc-400 leading-relaxed">
              In an era of slow, ad-heavy, and cluttered utility sites, Ghost Platform was built to be different. Our mission is to offer a **"Ghost-like" experience**: lightweight, invisible until needed, and incredibly fast. Every tool on this platform is built using cutting-edge AI to ensure maximum efficiency and modern standards.
            </p>
          </div>

          <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">How It Works</h2>
            <ul className="space-y-4 text-zinc-400">
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">01.</span>
                <span>**Trend Analysis:** Our system scans global developer trends weekly to identify high-demand utilities.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">02.</span>
                <span>**AI Generation:** We utilize the Gemini 3 Flash model to generate clean, TypeScript-safe React components.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold">03.</span>
                <span>**Zero Tracking:** We believe in privacy. All conversions (JSON, YAML, Passwords) happen locally in your browser.</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Privacy First</h2>
            <p className="text-zinc-400 leading-relaxed">
              Unlike other platforms, Ghost Platform does not store your data. Whether you are generating a secure password or converting sensitive JSON files, the processing is done via client-side JavaScript. Your data never touches our servers.
            </p>
          </div>
        </section>

        <footer className="mt-20 pt-8 border-t border-zinc-800 text-center">
          <p className="text-zinc-600 italic">Built for the future of the web. Fully Automated. 2026.</p>
        </footer>
      </div>
    </div>
  );
}