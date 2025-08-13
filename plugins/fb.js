const { cmd, commands } = require("../command");
const getFbVideoInfo = require("@xaviabot/fb-downloader");

cmd(
  {
    pattern: "fb",
    alias: ["facebook"],
    react: "✅",
    desc: "Download Facebook Video",
    category: "download",
    filename: __filename,
  },
  async (
    saduni,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*Please provide a valid Facebook video URL!* ❤️");

      const fbRegex = /(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/;
      if (!fbRegex.test(q))
        return reply("*වැරදි Facebook URL එකක්! ආයෙ බලහන්.* ☹️");

      reply("*ඔයාගෙ Video එක Download වෙන ගමන්...* ❤️");

      const result = await getFbVideoInfo(q);
      if (!result || (!result.sd && !result.hd)) {
        return reply("*මොකක් හරි අවුලක් අයෙ Try කරහන්.* ☹️");
      }

      const { title, sd, hd } = result;
      const bestQualityUrl = hd || sd;
      const qualityText = hd ? "HD" : "SD";

      const desc = `
Your fb video
👻 *Title*: ${title || "Unknown"}
👻 *Quality*: ${qualityText}
`;

      await saduni.sendMessage(
        from,
        {
          image: {
            url: "https://github.com/captainyasiya/Saduni-recreate/blob/main/images/SADUNI%20-%20MD%20facebook.png?raw=true",
          },
          caption: desc,
        },
        { quoted: mek }
      );

      await saduni.sendMessage(
        from,
        {
          video: { url: bestQualityUrl },
          caption: `*📥 Download කරා ${qualityText} quality*`,
        },
        { quoted: mek }
      );

      return reply("ස්තූති සදුනිව පවිච්චි කරාට");
    } catch (e) {
      console.error(e);
      reply(`*Error:* ${e.message || e}`);
    }
  }
);
