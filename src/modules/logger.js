const COLOR = require('../constants/consoleColors.js');

function info(content){
    if(process.env.LOG_INFO) console.log(COLOR.BLUE, '[INFO]' + content);
}

function error(content){
    if(process.env.LOG_ERROR) console.log(COLOR.RED, '[ERROR]' + content);
}

function warn(content){
    if(process.env.LOG_WARN) console.log(COLOR.YELLOW, '[WARN]' + content);
}

function correct(content){
    if(process.env.LOG_SUCCESS) console.log(COLOR.GREEN, '[SUCCESS]' + content);
}

function debug(content){
    if(process.env.LOG_DEBUG) console.log('[DEBUG]' + content);
}

module.exports = {info, error, warn, correct, debug}