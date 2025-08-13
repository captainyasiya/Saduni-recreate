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

      let menuText = "*👋 𝙃𝙚𝙡𝙡𝙤𝙬,𖣔𖣔🧚‍♂️ 𝙄𝙈 SADUNI-𝙈𝘿 𝙒𝙃𝘼𝙏𝙎𝘼𝙋𝙋 𝘽𝙊𝙏🤖.𝙎𝙄𝙈𝙋𝙇𝙀 𝙅𝘼𝙑𝘼 𝙎𝘾𝙍𝙄𝙋𝙏 𝘽𝙊𝙏⚙️.YASIRU WIJEWARDHANA 𝙄𝙎 𝙈𝙔 𝘾𝙍𝙀𝘼𝙏𝙀𝙍👨‍💻*📋 *Available Commands:*\n";
        
      

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



