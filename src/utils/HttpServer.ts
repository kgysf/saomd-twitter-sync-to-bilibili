import http from "http";
import {log} from "../utils/Log";

export class HttpServer {

    server:http.Server;
    port:number = 8888;
    html:string = "";

    constructor(port:number) {
        this.server = http.createServer((request, response) => {
            response.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
            response.end(this.html);
        });
        this.port = port
    }

    start() {
        this.server.listen(this.port);
        log.def.info(`服务已启动，端口：${this.port}`);
    }

    stop() {
        this.server.close();
        log.def.info(`服务已关闭`);
    }

    setHtml(html:string) {
        this.html = html;
    }

}