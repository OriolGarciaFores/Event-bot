const db = require('../dataBase');

module.exports = {
  addGuild: (id, name) => {
    const query = db.prepare('INSERT OR IGNORE INTO guild (id, name) VALUES (?, ?)');
    query.run(id, name);
  },

  getGuild: (id) => {
    const query = db.prepare('SELECT * FROM guild WHERE id = ?');
    return query.get(id);
  },

  updateGuildName: (id, name) => {
    const query = db.prepare('UPDATE guild SET name = ? WHERE id = ?');
    query.run(name, id);
  },

  deleteGuild: (id) => {
    const query = db.prepare('DELETE FROM guild WHERE id = ?');
    query.run(id);
  },

  initializeGuilds: (guilds) => {
    const query = db.prepare('INSERT OR IGNORE INTO guild (id, name) VALUES (?, ?)');

    const insertMany = db.transaction((guilds) => {
      for (const guild of guilds) {
        query.run(guild.id, guild.name);
      }
    });

    insertMany(guilds);
  }
};
