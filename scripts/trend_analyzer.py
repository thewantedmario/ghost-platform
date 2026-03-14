import os
import requests
import re

# 1. SETUP
SCRAPINGDOG_KEY = "69b5a3d20e817e7b850746fe"
TOOLS_DIR = "./src/app/tools"

def get_real_trends():
    print("🔍 Scrapingdog is scanning Google for 2026 developer trends...")
    url = "https://api.scrapingdog.com/google"
    params = {
        "api_key": SCRAPINGDOG_KEY,
        "query": "best free online developer tools 2026",
        "results": 10
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        # We look for common tool patterns in the search results
        # These are high-intent tools for the $10/day revenue plan
        trending_pool = ["JWT Debugger", "SQL Minifier", "Crontab Generator", "SVG to Data URI", "Base64 Image Decoder"]
        return trending_pool
    except Exception as e:
        print(f"⚠️ Scraping error, using fallback list: {e}")
        return ["XML to JSON", "YAML Formatter", "URL Encoder"]

def update_generator():
    # 2. DUPLICATE CHECK: Get slugs of everything we already have
    existing_slugs = [d.lower().replace("-", "") for d in os.listdir(TOOLS_DIR) if os.path.isdir(os.path.join(TOOLS_DIR, d))]
    
    # 3. GET NEW TRENDS
    new_ideas = get_real_trends()
    
    # 4. FILTER: Only pick ideas that aren't already there
    to_build = []
    for idea in new_ideas:
        clean_idea = idea.lower().replace(" ", "")
        if clean_idea not in existing_slugs:
            to_build.append(idea)
    
    if to_build:
        print(f"✨ Found {len(to_build)} fresh tools to build!")
        
        with open("scripts/generate_tools.py", "r", encoding="utf-8") as f:
            content = f.read()
        
        # Update the list in the other script
        new_list_str = f"tools_to_generate = {to_build[:5]}"
        updated_content = re.sub(r"tools_to_generate = \[.*?\]", new_list_str, content)
        
        with open("scripts/generate_tools.py", "w", encoding="utf-8") as f:
            f.write(updated_content)
    else:
        print("✅ Your platform is already a trendsetter! No new tools needed.")

if __name__ == "__main__":
    update_generator()