const { cmd } = require("../command");
const yts = require("yt-search");

cmd(
  {
    pattern: "yts",
    alias: ["yts", "youtubesearch"],
    react: "🔎",
    desc: "Search YouTube videos",
    category: "search",
    filename: __filename,
  },
  async (
    saduni,
    mek,
    m,
    {
      from,
      quoted,
      q,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*Video එකෙ නම එක්ක හොයන්න!* 🔍");

      reply("*Video එක හොයන ගමන්...* ⌛");

      const search = await yts(q);

      if (!search || !search.all || search.all.length === 0) {
        return reply("*Video හොයාගන්න බැරි උනා බන්.* ☹️");
      }

      const results = search.videos.slice(0, 10); 
      let formattedResults = results.map((v, i) => (
        `🎬 *${i + 1}. ${v.title}*\n📅 ${v.ago} | ⌛ ${v.timestamp} | 👁️ ${v.views.toLocaleString()} views\n🔗 ${v.url}`
      )).join("\n\n");

      const caption = `  
*_ඔයාගෙ youtube search results එක_*
      ─────────────────────────
🔎 *Query*: ${q}
${formattedResults}
   `;

      await saduni.sendMessage(
        from,
        {
          image: {
            url: "https://github.com/saduni-MD/saduni-MD/blob/main/images/yts.png?raw=true",
          },
          caption,
        },
        { quoted: mek }
      );
    } catch (err) {
      console.error(err);
      reply("*An error occurred while searching YouTube.* ❌");
    }
  }
);
