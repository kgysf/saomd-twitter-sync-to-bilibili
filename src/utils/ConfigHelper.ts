import fs from "fs";
import path from "path";
import {log} from "./Log";
import { AppConfig } from "../types/AppConfig";
import { Config } from "../interface/Config";

export class ConfigHelper {

    /**
     * 读取配置内容
     * @param file 配置文件类型
     * @returns 读取成功返回读取的配置文件，读取失败返回空
     */
    static read(file: string):string {
        let filePath:string = path.join(__dirname, `../conf/${file}.config.json`);
        try {
            let data:string = fs.readFileSync(filePath,'utf-8');
            return data;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                log.err.error(error.message);
            } else {
                log.def.warn(`配置文件[${filePath}]不存在，将使用默认配置。`)
            }
        }
        return "";
    }

    /**
     * 写配置文件
     * @param file 配置文件类型
     * @param data 要写入的配置，必须是实现Config接口的对象
     */
    static write(file: string, data: Config) {
        try {
            let filePath:string = path.join(__dirname, `../conf/${file}.config.json`);
            fs.writeFileSync(filePath, JSON.stringify(data),'utf-8');
            return true;
        } catch (error) {
            log.err.error(error.message);
            return false;
        }
    }

    /**
     * 读AppConfig
     * @returns 存在则读取文件内容返回，不存在则返回默认配置
     */
    static getAppConfig():AppConfig {
        let configString:string = ConfigHelper.read(AppConfig.fileName);
        let appConfig:AppConfig = configString ? JSON.parse(configString) : new AppConfig();
        return appConfig;
    }

    /**
     * 写AppConfig
     * @param appConfig 写入结果
     */
    static setAppConfig(appConfig:AppConfig):boolean {
        return ConfigHelper.write(AppConfig.fileName, appConfig);
    }

}