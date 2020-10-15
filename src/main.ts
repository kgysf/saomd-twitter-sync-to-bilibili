import {log} from "./utils/Log";
import {ConfigHelper} from "./utils/ConfigHelper";
import { UtilHelper } from "./utils/UtilHelper";
import { TwitterSpider } from "./spider/TwitterSpider";

log.def.info('starting...');

UtilHelper.mkdir("../conf");
let appConfig = ConfigHelper.getAppConfig();
ConfigHelper.setAppConfig(appConfig);
UtilHelper.mkdir(appConfig.cachePath);

log.def.debug('开发模式：'+appConfig.isDev);

async function twitterSpider() {
    try {
        await TwitterSpider.spiderTweet();
    } catch (error) {
        log.err.info("全局异常捕捉！");
        log.err.error(error.message);
    }
}

async function whileTimeout() {
    while (true) {
        await twitterSpider();
        await UtilHelper.sleep(1000 * 60 * 5);
    }
}
whileTimeout();
