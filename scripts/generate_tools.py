import os
from google import genai

# 1. SETUP THE CLIENT
# This uses your key locally OR the GitHub Secret automatically
API_KEY = os.environ.get("GEMINI_API_KEY") or "AIzaSyBsvF_4rJy8rMMklwiJDClfXOKeG6iHVSg"
client = genai.Client(api_key=API_KEY)

def generate_tool_page(tool_name):
    print(f"🚀 Generating code for: {tool_name}...")
    
    prompt = f"""
    Create a professional Next.js React component for a tool called '{tool_name}'.
    Use Tailwind CSS for a modern, dark-themed UI.
    Ensure the code is strictly TypeScript-safe with proper interfaces.
    Return ONLY the code. No markdown formatting, no ```tsx. Just the code.
    The tool must be fully interactive (use React hooks).
    Include a 'Copy to Clipboard' button if it's a generator.
    Make it look premium and high-end.
    """
    
    # 2. CALL THE MODERN MODEL (Using Gemini 3 Flash)
    response = client.models.generate_content(
        model='gemini-3-flash-preview',
        contents=prompt
    )
    
    code = response.text
    # Clean up formatting
    clean_code = code.replace("```tsx", "").replace("```javascript", "").replace("```", "").strip()
    
    # 3. SAVE THE FILE
    slug = tool_name.lower().replace(" ", "-")
    path = f"src/app/tools/{slug}"
    os.makedirs(path, exist_ok=True)
    
    # Added encoding="utf-8" to match your Trend-Spotter fix
    with open(f"{path}/page.tsx", "w", encoding="utf-8") as f:
        f.write("'use client';\n\n" + clean_code)

    print(f"✅ Success! File created at src/app/tools/{slug}/page.tsx")

# IMPORTANT: The Trend-Spotter rewrites this specific line below
tools_to_generate = ['JWT Debugger', 'SQL Minifier', 'Crontab Generator', 'SVG to Data URI', 'Base64 Image Decoder']

if __name__ == "__main__": 
    # Use the tools_to_generate list specifically
    for tool in tools_to_generate:
        try:
            generate_tool_page(tool)
        except Exception as e:
            print(f"❌ Error generating {tool}: {e}")