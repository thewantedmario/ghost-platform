import os

def prepare_product_hunt_kit():
    tools = [d for d in os.listdir("./src/app/tools") if os.path.isdir(os.path.join("./src/app/tools", d))]
    count = len(tools)
    
    kit = f"""
    🚀 PRODUCT HUNT LAUNCH KIT
    Title: Ghost Platform - {count}+ AI-Powered Dev Utilities
    Tagline: The fastest, zero-tracking utility hub for modern developers.
    Description: We automated a factory that builds tools based on Google trends. 
    Currently featuring: {', '.join([t.replace('-', ' ').title() for t in tools[:5]])}.
    """
    
    with open("LAUNCH_KIT.txt", "w", encoding="utf-8") as f:
        f.write(kit)
    print("✅ Step 3 Automated: LAUNCH_KIT.txt is ready for you to copy-paste.")

if __name__ == "__main__":
    prepare_product_hunt_kit()