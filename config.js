const { version } = require("discord.js");

require("dotenv").config();

function toBool(value) {
    if (!value) return false;
    const val = value.toString().toLowerCase();
    if (val === "true") return true;
    return false;
}

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    owner: {
        id: process.env.ID_OWNER,
        name: 'Tebrase'
    },
    logs: {
        infoEnable: toBool(process.env.LOG_INFO),
        debugEnable: toBool(process.env.LOG_DEBUG),
        errorEnable: toBool(process.env.LOG_ERROR),
        warnEnable: toBool(process.env.LOG_WARN),
        sucessEnable: toBool(process.env.LOG_SUCCESS)
    },
    status: {
        version: '1.6.1',
        description: '/help | Version: '
    }
}