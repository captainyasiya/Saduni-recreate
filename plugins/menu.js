const { cmd, commands } = require("../command");

cmd(
  {
    pattern: "menu",
    desc: "Displays all available commands",
    category: "main",
    filename: __filename,
  },
  async (
    danuwa,
    mek,
    m,
    {
      from,
      reply
    }
  ) => {
    try {
      const categories = {};

      for (let cmdName in commands) {
        const cmdData = commands[cmdName];
        const cat = cmdData.category?.toLowerCase() || "other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push({
          pattern: cmdData.pattern,
          desc: cmdData.desc || "No description"
        });
      }

      let menuText = "👋 𝙃𝙚𝙡𝙡𝙤𝙬, 𝙄 𝙢 සදුනි.        🤖 ʙᴏᴛ ɴᴀᴍᴇ :සදුනි        🔖 ᴠᴇʀsɪᴏɴ : 1.0        📟 ᴘʟᴀᴛғᴏʀᴍ : Github        👨‍💻 ᴏᴡɴᴇʀ: YASIRU WIJEWARDHANA        📋*Available Commands:*\n";
        
      

      for (const [cat, cmds] of Object.entries(categories)) {
        menuText += `\n📂 *${cat.toUpperCase()}*\n`;
        cmds.forEach(c => {
          menuText += `- .${c.pattern} : ${c.desc}\n`;
        });
      }

      await reply(menuText.trim());
    } catch (err) {
      console.error(err);
      reply("❌ Error generating menu.");
    }
  }
);





