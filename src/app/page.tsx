export default function Home() {
  const tools = [
    { name: "Secure Password Generator", path: "/tools/secure-password-generator", desc: "Generate unhackable passwords instantly." },
    { name: "JSON to YAML Converter", path: "/tools/json-to-yaml-converter", desc: "Convert data formats for developers." },
    { name: "Character Count Tool", path: "/tools/character-count-tool", desc: "Perfect for social media and SEO writing." },
    { name: "Unix Timestamp Converter", path: "/tools/unix-timestamp-converter", desc: "Convert epoch time to human-readable dates." },
    { name: "Unit Converter", path: "/tools/unit-converter", desc: "Convert between length, weight, temperature, and more." }
  ];

  return (
    <main className="min-h-screen bg-black text-white p-8 md:p-24 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          GhostTools
        </h1>
        <p className="text-zinc-400 mb-12 text-lg">Automated technical utilities for the modern web.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool) => (
            <a key={tool.path} href={tool.path} className="group p-6 border border-zinc-800 rounded-xl hover:border-blue-500 transition-all bg-zinc-900/50">
              <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400">{tool.name} &rarr;</h2>
              <p className="text-zinc-500 text-sm">{tool.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}