require('dotenv').load();
var Discord = require('discord.io');
var logger = require('winston');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
  
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';
var bot = new Discord.Client({
   token: process.env.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

        args = args.splice(1);
        var username = args[0];

        switch(cmd) {
            case 'apexstats':
            var request = require('request'), url = "https://public-api.tracker.gg/apex/v1/standard/profile/5/"+username;
            
            try {
                request(
                    {
                        url : url,
                        headers : {
                            "TRN-Api-Key" : "7488836b-98bc-46a9-859b-848fbb069057"
                        }
                    },
                    function (error, response, body) {
                        var content = JSON.parse(body);
                        var message = '';
                        if(content.errors){
                            message = content.errors[0].message;
                        }else{
                            message = "**Joueur**: "+username+"\n**Level**: "+content.data.metadata.level;
                            content.data.children.forEach(personnage => {
                                message += "\n\n**Champion**: "+personnage.metadata.legend_name;
                                personnage.stats.forEach(stat => {
                                    if(username == "Gadhena"){ stat.displayValue *= 100}
                                    message +="\n**"+stat.metadata.name+"**: "+stat.displayValue
                                });
                            });
                        }
                        bot.sendMessage({
                            to: channelID,
                            message: message
                        });                
                    }
                );       
            } catch (error) {
                bot.sendMessage({to: channelID, message: error});
            }      
            break;
         }
     }
});