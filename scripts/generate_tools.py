import os
from google import genai

# 1. SETUP THE CLIENT
# Replace with your key from AI Studio
API_KEY = "AIzaSyC5MWIupm1krl0z9qVT4fRRgrtdx6TdSds" 
client = genai.Client(api_key=API_KEY)

def generate_tool_page(tool_name):
    print(f"🚀 Generating code for: {tool_name}...")
    
    prompt = f"""
    Create a professional Next.js React component for a tool called '{tool_name}'.
    Use Tailwind CSS for a modern, dark-themed UI.
    Return ONLY the code. No markdown formatting, no ```tsx. Just the code.
    The tool must be fully interactive (use React hooks).
    Include a 'Copy to Clipboard' button if it's a generator.
    Make it look premium and high-end.
    """
    
    # 2. CALL THE MODERN MODEL
    response = client.models.generate_content(
        model='gemini-3-flash-preview',
        contents=prompt
    )
    
    code = response.text
    # Clean up formatting
    clean_code = code.replace("```tsx", "").replace("```javascript", "").replace("```", "").strip()
    
    # 3. SAVE THE FILE
    slug = tool_name.lower().replace(" ", "-")
    path = f"app/tools/{slug}"
    os.makedirs(path, exist_ok=True)
    
    with open(f"{path}/page.tsx", "w", encoding="utf-8") as f:
        f.write("'use client';\n\n" + clean_code)
    
    print(f"✅ Success! File created at app/tools/{slug}/page.tsx")

# Tools to build
tools = [
    "Secure Password Generator",
    "JSON to YAML Converter",
    "Character Count Tool",
    "Unix Timestamp Converter"
]

if __name__ == "__main__":
    for tool in tools:
        try:
            generate_tool_page(tool)
        except Exception as e:
            print(f"❌ Error generating {tool}: {e}")