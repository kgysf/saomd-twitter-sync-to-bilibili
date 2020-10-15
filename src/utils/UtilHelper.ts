import path from "path";
import fs from "fs";
import request from "request";
import querystring from "querystring";
import { log } from "./Log";
import { rejects } from "assert";
import { AppConfig } from "../types/AppConfig";
import { ConfigHelper } from "./ConfigHelper";

export class UtilHelper {

    /**
     * 下载文件
     * @param url 文件地址
     * @param proxy 是否使用代理
     */
    static download(url:string, proxy:boolean = true):Promise<request.Response> {
        let option:request.Options = {
            method: 'GET',
            url: url,
            encoding: null
        };
        let appConfig:AppConfig = ConfigHelper.getAppConfig();
        if (proxy && appConfig.isDev) {
            option.proxy = 'http://127.0.0.1:1080';
        }
        return new Promise((res, rej) => {
            log.def.debug(`开始下载${url}`);
            request(option, (err, data) => {
                if (err) {
                    rej(err);
                } else {
                    res(data);
                }
            });
        })
    }

    /**
     * 休眠
     * @param time 时长，单位ms
     */
    static sleep(time:number):Promise<undefined> {
        return new Promise((res,rej) => {
            setTimeout(() => {
                res(undefined);
            }, time);
        });
    }

    /**
     * promise封装request
     * @param option requestOption
     */
    static request(option:request.Options, body: any):Promise<RequestPromiseResult> {
        if (body) {
            option.body = querystring.stringify(body)
        }
        return new Promise((res, rej) => {
            try {
                request(option, (err, response, body) => {
                    res({err, response, body});
                });
            } catch (error) {
                rej(error);
            }
        })
    }

    /**
     * 目录不存在则创建
     * @param dirPath 文件夹路径，可用相对路径与绝对路径
     */
    static mkdir(dirPath:string) {
        let p = /^[A-Z]:/g.test(dirPath) ? dirPath : path.join(__dirname, dirPath);
        if (!fs.existsSync(p)) {
            fs.mkdirSync(p);
        }
    }

}


class RequestPromiseResult {
    err:any
    response:request.Response
    body:any
}