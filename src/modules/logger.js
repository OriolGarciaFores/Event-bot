const COLOR = require('../constants/consoleColors.js');

function info(content){
    if(process.env.LOG_INFO) {
        let fecha = new Date();
        console.log(COLOR.BLUE, '[INFO][' + fecha.toLocaleString() + '] ' + content);
    }
}

function error(content){
    if(process.env.LOG_ERROR) {
        console.log(COLOR.RED, '[ERROR][' + fecha.toLocaleString() + '] ' + content);
    }
}

function warn(content){
    if(process.env.LOG_WARN) {
        let fecha = new Date();
        console.log(COLOR.YELLOW, '[WARN][' + fecha.toLocaleString() + '] ' + content);
    }
}

function correct(content){
    if(process.env.LOG_SUCCESS) {
        let fecha = new Date();
        console.log(COLOR.GREEN, '[SUCCESS][' + fecha.toLocaleString() + '] ' + content);
    }
}

function debug(content){
    if(process.env.LOG_DEBUG) {
        let fecha = new Date();
        console.log('[DEBUG][' + fecha.toLocaleString() + '] ' + content);
    }
}

module.exports = {info, error, warn, correct, debug}