"""
Carp Tycoon Smoke Check - Debug Errors
"""
import json
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:8080"
REPORT = []

def log(flow, status, detail=""):
    entry = {"flow": flow, "status": status, "detail": detail}
    REPORT.append(entry)
    print(f"[{status}] {flow}: {detail}")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        
        console_logs = []
        def on_console(msg):
            text = msg.text
            if text.strip():
                console_logs.append(text)
        page.on("console", on_console)
        
        def on_pageerror(err):
            stack = getattr(err, 'stack', 'no stack')
            console_logs.append(f"PAGEERROR: {err}\nSTACK: {stack}")
        page.on("pageerror", on_pageerror)

        try:
            page.goto(BASE_URL, wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(4000)
            
            # Dismiss welcome
            welcome_start = page.locator("#welcome-start-btn")
            if welcome_start.is_visible(timeout=2000):
                welcome_start.click()
                page.wait_for_timeout(1500)
            
            # Try all tabs to trigger any Dashboard references
            tabs = ["dashboard", "lakes", "buylakes", "anglers", "rigs", "breeding", "finance", "shop", "staff", "cards", "news"]
            for tab in tabs:
                page.click(f"button[data-tab='{tab}']")
                page.wait_for_timeout(500)
            
            page.wait_for_timeout(1000)
            
        except Exception as e:
            log("smoke-check", "FAIL", f"Exception: {str(e)}")
        finally:
            context.close()
            browser.close()
    
    with open("smoke_report.json", "w") as f:
        json.dump(REPORT, f, indent=2)
    
    print("\n=== ALL CONSOLE LOGS ===")
    for line in console_logs:
        print(line)
    
    print(f"\nTotal entries: {len(console_logs)}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
