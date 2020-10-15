import crypto from "crypto";
import fs from "fs";
import path from "path";
import moment from "moment";
import {log} from "../utils/Log";
import { TranslateHelper } from "../utils/TranslateHelper";
import { UtilHelper } from "../utils/UtilHelper";
import { AppConfig } from "./AppConfig";
import { ConfigHelper } from "../utils/ConfigHelper";


export class Tweet {

    id:string
    createdAt: number;
    createdAtString: string;
    context: string;
    photos: string[];
    video: string[];
    hasVideo: boolean;
    photosPath: string[];
    biliText: string;

    constructor(obj:TweetAttr) {
        let time = new Date(obj.created_at).getTime();
        this.id = obj.id_str;
        this.createdAt = time;
        this.createdAtString = moment(time).format('YYYY-MM-DD HH:mm:ss');
        this.context = obj.full_text;
        this.context = this.context.replace(/&amp;/g, '&');
        this.context = this.context.replace(/!! /g, '! ');
        this.photos = [];
        this.video = [];
        this.hasVideo = false;
        if (obj.extended_entities && obj.extended_entities.media) {
            for (const m of obj.extended_entities.media) {
                if (m.type === 'photo') {
                    this.photos.push(m.media_url);
                } else if (m.type === 'video') {
                    this.photos.push(m.media_url);
                    this.hasVideo = true;
                }
            }
        }
    }


    async generate() {
        let cnStrList:any = null;
        let cnStr:string = "";
        let appConfig:AppConfig = ConfigHelper.getAppConfig();
        try {
            cnStrList = await TranslateHelper.translate(this.context);
            if (cnStrList.trans_result && cnStrList.trans_result.length > 0) {
                cnStr = "\n"
                for (const row of cnStrList.trans_result) {
                    cnStr += "\n"+row.dst;
                }
            }
        } catch (e) {
            console.log(e.message);
            cnStr = "\n\n中文翻译失败"
        }
        let str:string = `${appConfig.isDev ? '[测试]' : ''}[日|中] SAOMD 官方推特更新：\n\n${this.context}${cnStr}\n`
        str = str.replace(/https:\/\/t\.co\/[A-Za-z0-9].*/g, '');
        this.photosPath = [];
        this.biliText = str;
        for (let url of this.photos) {
            try {
                let suffix = url.replace(/^.*?\.(png|jpg|jpeg|gif).*?$/, '$1')
                let response = await UtilHelper.download(url, true);
                let fsHash = crypto.createHash('md5');
                fsHash.update(response.body);
                let md5 = fsHash.digest('hex');
                let p = path.join(__dirname, `${appConfig.cachePath}${md5}.${suffix}`);
                fs.writeFileSync(p, response.body);
                this.photosPath.push(p);
            } catch (e) {
                console.error(e);
                this.biliText += `[图片获取失败|${url}]\n`;
            }
        }
        this.biliText += appConfig.isDev ? `\nhttps://twitter.com/saomd_gameinfo/status/${this.id}` : '';
        if (this.hasVideo) {
            this.biliText += '\n图为原推视频封面，视频请到原推查看';
        }
        this.biliText += '\n\n本动态由脚本自动搬运，中文翻译为自动机翻不保证准确性；如有懂日语的可在评论区帮忙翻译。\n#刀剑神域记忆重组##刀剑神域记忆碎片##SAOMD#'
        return this.biliText;
    }

}


export class TweetAttr {
    id_str:string
    created_at: string
    full_text: string
    extended_entities:ExtendedEntities
}

class ExtendedEntities {
    media:ExtendedEntitiesMedia[]
}

class ExtendedEntitiesMedia {
    type:string
    media_url:string
}