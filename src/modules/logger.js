const COLOR = require('../constants/consoleColors.js');
const config = require('../../config');

function info(content){
    if(config.logs.infoEnable) {
        let fecha = new Date();
        console.log(COLOR.BLUE, '[INFO][' + fecha.toLocaleString() + '] ' + content);
    }
}

function error(content){
    if(config.logs.errorEnable) {
        let fecha = new Date();
        console.log(COLOR.RED, '[ERROR][' + fecha.toLocaleString() + '] ' + content);
    }
}

function warn(content){
    if(config.logs.warnEnable) {
        let fecha = new Date();
        console.log(COLOR.YELLOW, '[WARN][' + fecha.toLocaleString() + '] ' + content);
    }
}

function correct(content){
    if(config.logs.sucessEnable) {
        let fecha = new Date();
        console.log(COLOR.GREEN, '[SUCCESS][' + fecha.toLocaleString() + '] ' + content);
    }
}

function debug(content){
    if(config.logs.debugEnable) {
        let fecha = new Date();
        console.log('[DEBUG][' + fecha.toLocaleString() + '] ' + content);
    }
}

module.exports = {info, error, warn, correct, debug}