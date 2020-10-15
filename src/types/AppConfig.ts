import {Config} from "../interface/Config";

export class AppConfig implements Config {

    static fileName:string = "app"
    isDev: boolean = false
    cachePath:string = '../cache/'
    twitterConfig:TwitterConfig = new TwitterConfig()

    constructor(conf?:string|AppConfig) {
        let tmp:AppConfig|null = null;
        try {
            if (typeof conf === "string") {
                tmp = JSON.parse(conf);
            }
        } catch (error) {}
        if (tmp) {
            this.isDev = tmp.isDev || this.isDev;
            this.twitterConfig = tmp.twitterConfig || this.twitterConfig;
            this.cachePath = tmp.cachePath || this.cachePath;
        }
    }

}


export class TwitterConfig {

    lastRequestTime:number = 1596684916000

    constructor(conf?:TwitterConfig) {
        if (conf && conf.lastRequestTime) {
            this.lastRequestTime = conf.lastRequestTime
        }
    }

}