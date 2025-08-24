const db = require('../dataBase');

module.exports = {
  addGuild: (id, name) => {
    db.run('INSERT OR IGNORE INTO guild (id, name) VALUES (?, ?)', [id, name]);
  },

  getGuild: (id, callback) => {
    db.get('SELECT * FROM guild WHERE id = ?', [id], callback);
  },

  updateGuildName: (id, name) => {
    db.run('UPDATE guild SET name = ? WHERE id = ?', [name, id]);
  },

  deleteGuild: (id) => {
    db.run('DELETE FROM guild WHERE id = ?', [id]);
  },

  initializeGuilds: (guilds) => {
    guilds.forEach(guild => {
      db.run('INSERT OR IGNORE INTO guild (id, name) VALUES (?, ?)', [guild.id, guild.name]);
    });
  }
};
