import log4js from "log4js";
import path from "path";

let logPath = path.join(__dirname, '../logs/')

log4js.configure({
    appenders: {
        console: {
            type: "console",
            alwaysIncludePattern: true,
        },
        cheese: {
            type: 'dateFile',
            filename: logPath+'log',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
        },
        error: {
            type: "dateFile",
            filename: logPath+'error',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true,
        },
    },
    categories: {
        default: {
            appenders: ['cheese', 'console'],
            level: 'all'
        },
        error: {
            appenders: ['error', 'console'],
            level: 'error'
        },
    }
});

const log = {
    def: log4js.getLogger(),
    err: log4js.getLogger("error"),
};

export {
    log
}