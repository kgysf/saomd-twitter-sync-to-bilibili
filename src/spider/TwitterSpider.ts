import path from "path";
import fs from "fs";
import { PuppeteerHelper } from "../utils/PuppeteerHelper";
import { log } from "../utils/Log";
import { AppConfig } from "../types/AppConfig";
import { Tweet, TweetAttr } from "../types/Tweet";
import { ConfigHelper } from "../utils/ConfigHelper";
import { BiliSpider } from "./BiliSpider";

export class TwitterSpider {

    /**
     * 获取Tweet列表
     * @param callback
     */
    static async getTweetList(callback:Function) {
        let page = await PuppeteerHelper.createPage();
        page.on('response', async rep => {
            let url = rep.url() || '';
            if (url.indexOf('timeline/profile/769152017453322240.json') > -1) {
                log.def.debug(`拦截到请求：${url.substr(0,66)}`);
                try {
                    let data:any = await rep.json();
                    callback && callback(<any>data.globalObjects.tweets);
                } catch (error) {
                    log.def.warn(error.message);
                }
            }
        });
        
        try {
            await page.goto('https://twitter.com/saomd_gameinfo', {
                timeout: 30 * 1000,
                waitUntil: [
                    'load',
                    'domcontentloaded',
                    'networkidle0'
                ]
            });
            await PuppeteerHelper.closePage(page);
        } catch(error) {
            console.log(error.message)
        }
    }

    /**
     * 爬Tweet入口
     */
    static async spiderTweet() {
        log.def.info(`开始爬取推文`);
        let appConfig:AppConfig = ConfigHelper.getAppConfig();
        let lastTime = appConfig.twitterConfig.lastRequestTime;
        TwitterSpider.getTweetList(async (tweets:any) => {
            log.def.info(`拦截到推文`);
            let newTweets:Tweet[] = [];
            for (const id in tweets) {
                let tweetAttr:TweetAttr = tweets[id];
                let tweet = new Tweet(tweetAttr);
                if (tweet.createdAt > lastTime) {
                    newTweets.push(tweet);
                }
            }
            if (newTweets.length <= 0) {
                log.def.info(`无新推文.`);
                await PuppeteerHelper.closeAll();
                return;
            };
            log.def.info(`有新推文`)
            newTweets.sort((a, b) => a.createdAt - b.createdAt);
            let page = await BiliSpider.login();
            for (const i in newTweets) {
                let tweet = newTweets[i];
                await tweet.generate();
                log.def.info(`发送推文${tweet.id}到动态.`);
                // 发送动态
                await BiliSpider.sendDynamic(page, tweet);
            }
            await PuppeteerHelper.closeAll();
            // 重新获取更新配置后保存
            appConfig = ConfigHelper.getAppConfig();
            appConfig.twitterConfig.lastRequestTime = newTweets[newTweets.length - 1].createdAt;
            ConfigHelper.setAppConfig(appConfig);
            log.def.info(`Done.`);
        });
    }

}