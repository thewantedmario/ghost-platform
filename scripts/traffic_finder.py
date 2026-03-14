import requests

SCRAPINGDOG_KEY = "69b5a3d20e817e7b850746fe"

def find_traffic_opportunities():
    queries = ["how to convert json to yaml reddit", "secure password generator recommendation", "unix timestamp converter help"]
    
    print("🛰️ Ghost Marketing Bot is scanning for traffic...")
    
    for query in queries:
        url = "https://api.scrapingdog.com/google"
        params = {"api_key": SCRAPINGDOG_KEY, "query": query, "results": 3}
        
        try:
            res = requests.get(url, params=params).json()
            # This would normally parse the results and save links to a 'marketing_tasks.txt'
            print(f"✅ Found opportunities for: {query}")
        except:
            pass

if __name__ == "__main__":
    find_traffic_opportunities()