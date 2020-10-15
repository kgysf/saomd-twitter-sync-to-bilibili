import crypto from "crypto";
import { UtilHelper } from "./UtilHelper";

export enum LangCode {
    JP = "jp",
    CN = "zh",
    EN = "en"
}

export class TranslateHelper {

	// 自己申请百度翻译api
    private static APPID:string = "";
    private static KEY:string = "";

    /**
     * 生成签名
     * @param query 
     * @param salt 
     */
    private static generateSign(query:string, salt:number|string):string {
        let md5 = crypto.createHash('md5');
        return md5.update(TranslateHelper.APPID + query + salt + TranslateHelper.KEY).digest('hex');
    }

    /**
     * 百度翻译
     * @param str 
     * @param from 
     * @param to 
     */
    static async translate(str:string, from:LangCode = LangCode.JP, to:LangCode = LangCode.CN) {
        str = str.replace(/#メモデフ/g, '');
        let salt:number = new Date().getTime();
        salt = Number(String(salt).substr(8));
        let sign = TranslateHelper.generateSign(str, salt);
        let body = {
            q: str,
            from: from,
            to: to,
            appid: TranslateHelper.APPID,
            salt,
            sign
        }
        let option = {
            method: 'POST',
            url: "http://api.fanyi.baidu.com/api/trans/vip/translate",
            encoding: 'UTF-8',
            json: true,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
        }
        let rep = await UtilHelper.request(option, body);
        return rep.body;
    }

}