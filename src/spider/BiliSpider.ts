import path from "path";
import { Page } from "puppeteer";
import { PuppeteerHelper } from "../utils/PuppeteerHelper";
import { log } from "../utils/Log";
import { ConfigHelper } from "../utils/ConfigHelper";
import { AppConfig } from "../types/AppConfig";
import { HttpServer } from "../utils/HttpServer";
import { Tweet } from "../types/Tweet";
import { UtilHelper } from "../utils/UtilHelper";


export class BiliSpider {

    /**
     * 登录并获取page
     */
    static async login():Promise<Page> {
        let appConfig:AppConfig = ConfigHelper.getAppConfig();
        let page = await PuppeteerHelper.createPage();
        await page.goto('https://t.bilibili.com/', {
            timeout: 30 * 1000,
            waitUntil: [
                'load',
                'domcontentloaded',
                'networkidle0'
            ]
        });
        let loginBtn = await page.$('.login');
        let isLogin = !loginBtn;
        if (loginBtn) {
            await loginBtn.click();
        }
        let server:HttpServer = new HttpServer(2396);
        server.start();
        let startDate:Date = new Date();
        while (!isLogin) {
            await page.waitFor(1000);
            let qrcodeBtn = await page.waitForSelector('.bili-mini-login-group .el-button.bili-mini-width-max.el-button--default');
            qrcodeBtn.click();
            let qrcode = await page.waitForSelector('.bili-mini-scan-code');
            await UtilHelper.sleep(500);
            let buffer = await qrcode.screenshot({
                type: "png",
                path: path.join(__dirname, `${appConfig.cachePath}loginqrcode.png`)
            });
            let now:Date = new Date();
            let imgBase64 = buffer.toString("base64");
            let html = `<html><body style="text-align: center"><img src="data:image/png;base64,${imgBase64}" /><br/>
            <span>开始：${startDate.getMonth()+1}-${startDate.getDate()} ${startDate.getHours()}:${startDate.getMinutes()}:${startDate.getSeconds()}</span><br/>
            <span>当前：${now.getMonth()+1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}</span>
            </body></html>`;
            server.setHtml(html);
            try {
                await page.waitForNavigation();
                log.def.info("登录成功！");
                isLogin = true;
            } catch (error) {
                log.def.warn("登录超时，即将刷新二维码");
                let qrcodeReturnBtn = await page.waitForSelector('.bili-mini-login-group .el-button.bili-mini-width-max.el-button--primary');
                await qrcodeReturnBtn.click();
            }
        }
        server.stop();
        return page;
    }

    /**
     * 发送动态
     * @param page 
     * @param tweet 
     */
    static async sendDynamic(page:Page, tweet:Tweet) {
        log.def.debug("获取编辑器")
        let editor = await page.waitForSelector('#editor');
        log.def.debug("编辑器全选清除")
        await editor.type(' ', {delay: 0});
        await page.keyboard.down('ControlLeft');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('ControlLeft');
        await page.keyboard.press('Backspace');
        log.def.debug("编辑动态内容")
        await editor.type(tweet.biliText, {delay: 0});
        log.def.debug("展开图片上传面板")
        await page.$eval('.image-box.toolbar-item', (el, value) => el.setAttribute('class', value), 'd-i-block bp-v-middle bp-icon-font icon-pic-btn box-toggle active');
        await page.$eval('.image-popup > div', (el, value) => el.setAttribute('class', value), 'static-popup upload-image-box bp-arrow');
        await page.$eval('.image-popup > div', (el, value) => el.setAttribute('style', value), 'width: 290px;');
        log.def.debug("开始上传图片")
        let upload = await page.waitForSelector('input[class="upload pointer"]');
        for (const i in tweet.photosPath) {
            if (tweet.photosPath.hasOwnProperty(i)) {
                const p = tweet.photosPath[i];
                await upload.uploadFile(p);
            }
        }
        log.def.debug("获取发布按钮并发布")
        let publish = await page.waitForSelector('button[class="publish-btn d-i-block bp-v-middle"]');
        await publish.click();
        await UtilHelper.sleep(1000);
        await page.screenshot({
            type: "png",
            path: path.join(__dirname, `../cache/page.png`)
        });
        try {
            log.def.debug("获取协议按钮并同意协议")
            let ctnr = await page.waitForSelector('.popup-btn-ctnr button[class="bl-button panel-btn bl-button--primary bl-button--size"]');
            await ctnr.click();
        } catch (error) {
            console.log(error.message);
        }
        await UtilHelper.sleep(1000 * 5);
        log.def.debug("重载页面")
        await page.reload();
    }

    /**
     * 批量发送动态
     * @param page 
     * @param tweets 
     */
    static async sendDynamics(page:Page, tweets:Tweet[]) {
        for (let tweet of tweets) {
            try {
                await BiliSpider.sendDynamic(page, tweet);
            } catch (error) {
                log.err.info(`发送动态[${tweet.id}]出错！`);
                log.err.error(error.message);
            }
        }
    }

}