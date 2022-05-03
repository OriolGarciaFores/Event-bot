const guildSchema = require("../schema/guild.js");
const log = require("../../modules/logger");

async function findById(key){

    let guild = await guildSchema.find({ id: key });
    if(guild){
        return guild[0];
    }
}

async function create(guild){
    let guildDB = new guildSchema({
        id: guild.id,
        nombre: 'GUILD_NAME',
        channelsId : guild.channelsId
    });

    await guildDB.save().then(guild => {
        log.correct('Se ha añadido la nueva guild ' + guild.id);
    }).catch(err => {
       log.error(err);
    });
}

async function updateChannelsId(guildId, channelsId){
    await guildSchema.find({id: guildId}).then(async guild => {
        await guildSchema.updateOne({_id: guild[0]._id}, {channelsId: channelsId}).then(() => {
            log.correct('Se ha actualizado la guild ' + guildId);
         }).catch(err => {
             log.error(err);
         });
    })
}

async function findAll(){
    return await guildSchema.find();
}

async function deleteById(){}

module.exports = {findById, create, updateChannelsId, findAll}