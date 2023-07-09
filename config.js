const { version } = require("discord.js");

require("dotenv").config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    mongoDB: process.env.MONGO_DB,
    owner: {
        id: process.env.ID_OWNER,
        name: 'Tebrase'
    },
    logs: {
        infoEnable: process.env.LOG_INFO,
        debugEnable: process.env.LOG_DEBUG,
        errorEnable: process.env.LOG_ERROR,
        warnEnable: process.env.LOG_WARN,
        sucessEnable: process.env.LOG_SUCCESS
    },
    status: {
        version: '1.5.2',
        description: '/help | Version: ',
        type: 'PLAYING'
    }
}