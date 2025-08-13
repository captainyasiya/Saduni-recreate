const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const fs = require('fs');
const P = require('pino');
const express = require('express');
const path = require('path');
const { sms } = require('./lib/msg');
const { getGroupAdmins } = require('./lib/functions');
const { File } = require('megajs');
const { commands, replyHandlers } = require('./command');

const app = express();
const port = process.env.PORT || 8000;

const prefix = '.';
const ownerNumber = ['94765683261'];
const credsPath = path.join(__dirname, '/auth_info_baileys/creds.json');

// 🔹 Session check and download from MEGA if missing
async function ensureSessionFile() {
  if (!fs.existsSync(credsPath)) {
    if (!process.env.SESSION_ID) {
      console.error('❌ SESSION_ID env variable is missing.');
      process.exit(1);
    }

    console.log("🔄 saduni creds.json not found. Downloading session from MEGA...");
    const filer = File.fromURL(`https://mega.nz/file/${process.env.SESSION_ID}`);

    filer.download((err, data) => {
      if (err) {
        console.error("❌ Failed to download session file from MEGA:", err);
        process.exit(1);
      }
      fs.mkdirSync(path.join(__dirname, '/auth_info_baileys/'), { recursive: true });
      fs.writeFileSync(credsPath, data);
      console.log("✅ Session downloaded. Restarting bot...");
      setTimeout(() => connectToWA(), 2000);
    });
  } else {
    setTimeout(() => connectToWA(), 1000);
  }
}

// 🔹 Safe media send function with retry
async function sendMediaSafely(bot, jid, mediaUrl, caption) {
  for (let i = 0; i < 3; i++) {
    try {
      await bot.sendMessage(jid, { image: { url: mediaUrl }, caption });
      console.log('Media sent successfully');
      break;
    } catch (err) {
      console.log(`Media send failed (retry #${i + 1}):`, err?.message || err);
      await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds before retry
    }
  }
}

// 🔹 Connect to WhatsApp
async function connectToWA() {
  console.log("Connecting SADUNI-MD 🧬...");
  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, '/auth_info_baileys/'));
  const { version } = await fetchLatestBaileysVersion();

  const saduni = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    auth: state,
    version,
    syncFullHistory: true,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  });

  // 🔹 Save credentials on update
  saduni.ev.on('creds.update', saveCreds);

  // 🔹 Connection updates (reconnect if closed)
  saduni.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        console.log("Connection closed. Reconnecting...");
        connectToWA();
      } else {
        console.log("Logged out from WhatsApp.");
      }
    } else if (connection === 'open') {
      console.log('✅ සදුනි-MD connected to WhatsApp');

      // 🔹 Send initial message to owner safely
      const up = `සදුනි-MD connected ✅\n\n PREFIX: ${prefix}`;
      await sendMediaSafely(
        saduni,
        ownerNumber[0] + "@s.whatsapp.net",
        "https://github.com/captainyasiya/Saduni-recreate/blob/main/images/SADUNI%20-%20MD%202.0.png?raw=true",
        up
      );

      // 🔹 Load plugins
      fs.readdirSync("./plugins/").forEach((plugin) => {
        if (path.extname(plugin).toLowerCase() === ".js") {
          require(`./plugins/${plugin}`);
        }
      });
    }
  });

  // 🔹 Messages handling
  saduni.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (msg.messageStubType === 68) {
        await saduni.sendMessageAck(msg.key);
      }
    }

    const mek = messages[0];
    if (!mek || !mek.message) return;
    mek.message = getContentType(mek.message) === 'ephemeralMessage'
      ? mek.message.ephemeralMessage.message
      : mek.message;
    if (mek.key.remoteJid === 'status@broadcast') return;

    const m = sms(saduni, mek);
    const type = getContentType(mek.message);
    const from = mek.key.remoteJid;
    const body = type === 'conversation'
      ? mek.message.conversation
      : mek.message[type]?.text || mek.message[type]?.caption || '';
    const isCmd = body.startsWith(prefix);
    const commandName = isCmd ? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : '';
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(' ');

    const sender = mek.key.fromMe ? saduni.user.id : (mek.key.participant || mek.key.remoteJid);
    const senderNumber = sender.split('@')[0];
    const isGroup = from.endsWith('@g.us');
    const botNumber = saduni.user.id.split(':')[0];
    const pushname = mek.pushName || 'Sin Nombre';
    const isMe = botNumber.includes(senderNumber);
    const isOwner = ownerNumber.includes(senderNumber) || isMe;
    const botNumber2 = await jidNormalizedUser(saduni.user.id);

    const groupMetadata = isGroup ? await saduni.groupMetadata(from).catch(() => {}) : '';
    const groupName = isGroup ? groupMetadata.subject : '';
    const participants = isGroup ? groupMetadata.participants : '';
    const groupAdmins = isGroup ? await getGroupAdmins(participants) : '';
    const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
    const isAdmins = isGroup ? groupAdmins.includes(sender) : false;

    const reply = async (text) => {
      try {
        await saduni.sendMessage(from, { text }, { quoted: mek });
      } catch (err) {
        console.log("Reply failed:", err?.message || err);
      }
    };

    // 🔹 Command handling
    if (isCmd) {
      const cmd = commands.find((c) => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));
      if (cmd) {
        if (cmd.react) saduni.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
        try {
          await cmd.function(saduni, mek, m, {
            from, quoted: mek, body, isCmd, command: commandName, args, q,
            isGroup, sender, senderNumber, botNumber2, botNumber, pushname,
            isMe, isOwner, groupMetadata, groupName, participants, groupAdmins,
            isBotAdmins, isAdmins, reply,
          });
        } catch (e) {
          console.error("[PLUGIN ERROR]", e);
        }
      }
    }

    // 🔹 Reply handlers
    const replyText = body;
    for (const handler of replyHandlers) {
      if (handler.filter(replyText, { sender, message: mek })) {
        try {
          await handler.function(saduni, mek, m, { from, quoted: mek, body: replyText, sender, reply });
          break;
        } catch (e) {
          console.log("Reply handler error:", e);
        }
      }
    }
  });
}

ensureSessionFile();

// 🔹 Express server
app.get("/", (req, res) => res.send("Hey, සදුනි-MD started✅"));
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
