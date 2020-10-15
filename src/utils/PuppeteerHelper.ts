import puppeteer from "puppeteer";
import path from "path";
import { ConfigHelper } from "./ConfigHelper";
import { AppConfig } from "src/types/AppConfig";

export class PuppeteerHelper {

    static browser:puppeteer.Browser;
    static pages:puppeteer.Page[] = [];

    /**
     * 创建browser实例
     */
    static async createBrowser() {
        let appConfig:AppConfig = ConfigHelper.getAppConfig();
        PuppeteerHelper.browser = await puppeteer.launch({
            headless: !appConfig.isDev,
            slowMo: 0,       //放慢浏览器执行速度，方便测试观察
            args: [
                // '–no-sandbox',
                // '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ],
            ignoreDefaultArgs: ['--disable-extensions'],
            userDataDir: path.join(__dirname, `${appConfig.cachePath}userData`)
        });
    }

    /**
     * 创建page实例
     */
    static async createPage() {
        let browser = await PuppeteerHelper.getBrowser();
        const page = await browser.newPage();
        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36");
        const blockTypes = new Set(['image', 'media', 'font']);
        await page.setRequestInterception(true); //开启请求拦截
        page.on('request', request => {
            const type = request.resourceType();
            const shouldBlock = blockTypes.has(type);
            if (shouldBlock && request.url().indexOf('static.geetest.com') < 0 && request.url().indexOf('.svg') < 0) {
                return request.abort();
            } else {
                return request.continue();
            }
        });
        this.pages.push(page);
        return page;
    }

    /**
     * 获取browser实例，如果不存在则创建
     */
    static async getBrowser() {
        if (!PuppeteerHelper.browser) {
            await PuppeteerHelper.createBrowser();
        }
        return PuppeteerHelper.browser;
    }

    /**
     * 关闭全部page与browser
     */
    static async closeAll() {
        for (let page of PuppeteerHelper.pages) {
            page.isClosed() || await page.close();
        }
        await PuppeteerHelper.browser?.close();
        PuppeteerHelper.pages = [];
        PuppeteerHelper.browser = undefined;
    }

    /**
     * 关闭指定page
     * @param page 
     */
    static async closePage(page:puppeteer.Page) {
        let i = PuppeteerHelper.pages.indexOf(page);
        if (i > -1) {
            PuppeteerHelper.pages[i].isClosed() || await PuppeteerHelper.pages[i].close();
            PuppeteerHelper.pages.splice(i, 1);
        }
    }

}