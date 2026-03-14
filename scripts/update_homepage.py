import os

TOOLS_DIR = "./src/app/tools"
HOMEPAGE_PATH = "./src/app/page.tsx"

def update_home():
    # 1. Get all tool folders
    tools = [d for d in os.listdir(TOOLS_DIR) if os.path.isdir(os.path.join(TOOLS_DIR, d))]
    
    # 2. Generate the HTML for the Tool Cards
    tool_cards = ""
    for tool in tools:
        name = tool.replace("-", " ").title()
        tool_cards += f"""
        <a href="/tools/{tool}" className="group block p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-blue-500 transition-all">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400">{name}</h3>
          <p className="text-zinc-400 text-sm">Professional web utility for developers and creators.</p>
          <span className="mt-4 inline-block text-xs font-semibold text-blue-500 uppercase tracking-wider">Open Tool →</span>
        </a>"""

    # 3. Create the Full Home Page Code
    homepage_code = f"""
import React from 'react';

export default function HomePage() {{
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="max-w-6xl mx-auto px-6 py-20">
        <header className="mb-16 text-center">
          <h1 className="text-6xl font-extrabold mb-4 tracking-tighter">GHOST PLATFORM</h1>
          <p className="text-zinc-500 text-xl">The 2026 Ultimate Developer Utility Hub. Automated. Fast. Free.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tool_cards}
        </div>
      </div>
    </div>
  );
}}
"""

    # 4. Save the file
    with open(HOMEPAGE_PATH, "w", encoding="utf-8") as f:
        f.write(homepage_code)
    print(f"✅ Homepage updated with {len(tools)} tools!")

if __name__ == "__main__":
    update_home()