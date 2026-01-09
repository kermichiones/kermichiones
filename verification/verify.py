
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the mock file
        # We need absolute path
        cwd = os.getcwd()
        file_path = f"file://{cwd}/verification/mock_preview.html"

        page.goto(file_path)

        # Take screenshot
        page.screenshot(path="verification/verification.png", full_page=True)

        browser.close()

if __name__ == "__main__":
    run()
