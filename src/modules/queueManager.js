const log = require('./logger');

const queue = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || queue.length === 0) return;
    isProcessing = true;

    const task = queue.shift(); //Primera tarea

    try {
        const { type, command, reaction, user } = task;

        log.debug({
            command: command.slash.name,
            type: type,
            reaction: reaction.emoji.name,
            username: user.username
        });

        if (type === 'REACTION_ADD') {
            await await command.reactionAdd(reaction, user);
        } else if (type === 'REACTION_REMOVE') {
            await command.reactionRemove(reaction, user);
        } else {
            log.error('Error en queueManager: Type reaction incorrecto');
        }
    } catch (error) {
        log.error(error);
    }

    isProcessing = false;
    processQueue();
}

module.exports = {
    addToQueue: (task) => {
        queue.push(task);
        processQueue();
    }
};