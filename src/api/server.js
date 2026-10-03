const express = require('express');
const log = require('../modules/logger');
const COLOR = require('../constants/colors.js');

const PORT = process.env.PORT ?? 1234;

function createApi(client) {
    const app = express();

    app.disable('x-powered-by');

    //Esta funcionalidad trata las request antes de ir a las urls de la api
    //Middleware
    app.use(express.json());

    app.post('/discordbot-alts', async (req, res) => {
        const embedReport = {
            color: COLOR.GREY,
            title: '',
            description: ''
        };

        const { title, message, userId } = req.body;
        const user = await client.users.fetch(userId);

        embedReport.title = title;
        embedReport.description = message;

        user.send({ embeds: [embedReport] });

        res.json(req.body);
    })

    app.use((req, res) => {
        res.status(404).send('<h1>404</h1>')
    })

    return app;
}

function startApi(client) {
    const app = createApi(client);

    app.listen(PORT, () => {
        log.info(`Server listening on port http://localhost:${PORT}`);
    });
}

module.exports = {startApi}