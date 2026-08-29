"""
Carp Tycoon Smoke Check - Enhanced
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
            console_logs.append(f"PAGEERROR: {err}")
        page.on("pageerror", on_pageerror)

        try:
            log("dashboard-load", "START", "Navigating to localhost:8080")
            page.goto(BASE_URL, wait_until="domcontentloaded", timeout=15000)
            page.wait_for_timeout(3000)
            
            # Dismiss welcome screen if present
            welcome_start = page.locator("#welcome-start-btn")
            if welcome_start.is_visible(timeout=2000):
                log("dashboard-load", "INFO", "Welcome screen visible - clicking Start Game")
                welcome_start.click()
                page.wait_for_timeout(1500)
            
            title = page.title()
            if "Carp" in title or "Tycoon" in title:
                log("dashboard-load", "PASS", f"Title: {title}")
            else:
                log("dashboard-load", "FAIL", f"Title: {title}")
            
            stats = ["#day-counter", "#money-display", "#reputation-display", "#timer-display", "#weather-display"]
            for stat in stats:
                if page.is_visible(stat):
                    log("dashboard-load", "PASS", f"Visible: {stat}")
                else:
                    log("dashboard-load", "FAIL", f"Missing: {stat}")
            
            # --- Angler Booking ---
            log("angler-booking", "START", "Opening Anglers tab")
            page.click("button[data-tab='anglers']")
            page.wait_for_timeout(1500)
            
            if page.locator("#panel-anglers").is_visible():
                log("angler-booking", "PASS", "Anglers panel visible")
            else:
                log("angler-booking", "FAIL", "Anglers panel not visible")
            
            book_buttons = page.locator("button:has-text('Book'), button:has-text('Hire')")
            if book_buttons.count() > 0:
                book_buttons.first.click()
                page.wait_for_timeout(1000)
                log("angler-booking", "PASS", f"Booked angler (buttons found: {book_buttons.count()})")
            else:
                log("angler-booking", "INFO", "No Book/Hire buttons found")
            
            # --- Fish Cards ---
            log("fish-cards", "START", "Opening Cards tab")
            page.click("button[data-tab='cards']")
            page.wait_for_timeout(1500)
            
            if page.locator("#panel-cards").is_visible():
                log("fish-cards", "PASS", "Cards panel visible")
            else:
                log("fish-cards", "FAIL", "Cards panel not visible")
            
            # --- Button Responses ---
            log("button-responses", "START", "Testing buttons")
            
            pause_btn = page.locator("#pause-btn")
            if pause_btn.is_visible():
                pause_btn.click()
                page.wait_for_timeout(500)
                txt = pause_btn.inner_text()
                log("button-responses", "PASS", f"Pause clicked, text: {txt}")
            else:
                log("button-responses", "FAIL", "Pause button missing")
            
            speed_btn = page.locator("#speed-btn")
            if speed_btn.is_visible():
                speed_btn.click()
                page.wait_for_timeout(500)
                txt = speed_btn.inner_text()
                log("button-responses", "PASS", f"Speed clicked, text: {txt}")
            else:
                log("button-responses", "FAIL", "Speed button missing")
            
            # Log all console output for analysis
            log("console-output", "INFO", f"Total console entries: {len(console_logs)}")
            
        except Exception as e:
            log("smoke-check", "FAIL", f"Exception: {str(e)}")
        finally:
            context.close()
            browser.close()
    
    with open("smoke_report.json", "w") as f:
        json.dump(REPORT, f, indent=2)
    
    print("\n=== CONSOLE LOGS (last 30) ===")
    for line in console_logs[-30:]:
        print(line)
    
    print("\n=== SMOKE CHECK SUMMARY ===")
    passed = sum(1 for r in REPORT if r["status"] == "PASS")
    failed = sum(1 for r in REPORT if r["status"] == "FAIL")
    info = sum(1 for r in REPORT if r["status"] == "INFO")
    print(f"PASS: {passed} | FAIL: {failed} | INFO: {info}")
    
    if failed > 0:
        print("\nFAILURES:")
        for r in REPORT:
            if r["status"] == "FAIL":
                print(f"  - {r['flow']}: {r['detail']}")
    
    return failed

if __name__ == "__main__":
    sys.exit(main())
