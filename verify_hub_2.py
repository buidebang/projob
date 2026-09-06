from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto('http://localhost:3002/admin')
        time.sleep(3)
        page.screenshot(path='/home/jules/verification/screenshots/hub5.png')
        print("Captured screenshot at /home/jules/verification/screenshots/hub5.png")
        browser.close()

if __name__ == '__main__':
    run()
