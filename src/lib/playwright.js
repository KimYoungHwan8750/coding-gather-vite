import { chromium } from "playwright";

export class BrowserManager {
  static browser;
  
  static async getBrowser() {
    if (!this.browser) {
      return this.browser = await chromium.launch();
    }
    process.on('exit', async () => {
      await this.closeBrowser();
    })
    return this.browser;

  }

  static async closeBrowser() {
    if(this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  static async getPage() {
    this.browser?.newPage({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    })
  }
}