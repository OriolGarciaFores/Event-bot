const COLOR = require('../constants/consoleColors.js');

function info(content){
    console.log(COLOR.BLUE, content);
}

function error(content){
    console.log(COLOR.RED, content);
}

function warn(content){
    console.log(COLOR.YELLOW, content);
}

function correct(content){
    console.log(COLOR.GREEN, content);
}

module.exports = {info, error, warn, correct}