const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "VEAjETYA#1AFP0bjwnMWAxPsL71NwVPbC04fG6Xmgu3EP1RD0daM",
ALIVE_IMG: process.env.ALIVE_IMG || "https://github.com/captainyasiya/Saduni-recreate/blob/main/images/SADUNI%20-%20MD%20(1)alive.png?raw=true",
ALIVE_MSG: process.env.ALIVE_MSG || "*Hello👋 සදුනි Is Alive Now😍*",
BOT_OWNER: '94765683261',  // Replace with the owner's phone number



};
