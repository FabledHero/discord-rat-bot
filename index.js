require("dotenv").config();
9;
const { Client, GatewayIntentBits } = require("discord.js");
const { createCanvas } = require("canvas");
const db = require("./database");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!leaderboard")) {
    const users = db
      .prepare(
        "SELECT username, points FROM users ORDER BY points DESC LIMIT 59"
      )
      .all();
    if (users.length === 0) {
      return message.channel.send("No one has earned any points yet!");
    }
    //Visual Image
    const canvas = createCanvas(400, 250);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Leaderboard", 100, 30);

    //Put the users on the board.
    users.forEach((user, index) => {
      ctx.fillText(
        `${index + 1}. ${user.username} - ${user.points} pts`,
        50,
        70 + index * 40
      );
    });
    const out = fs.createWriteStream(__dirname + "/leaderboard.png");
    const stream = canvas.createPNGStream();
    stream.pipe(out);

    out.on("finish", () => {
      message.channel.send({
        files: [{ attachment: "leaderboard.png", name: "leaderboard.png" }],
      });
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!award")) {
    if (!message.member.permissions.has("ADMINISTRATOR"))
      return message.reply("You don't have permission!");

    const args = message.content.split(" ");
    const user = message.mentions.users.first();
    const points = parseInt(args[2]);

    if (!user || isNaN(points)) {
      return message.reply("Usage: `!award @user <points>`");
    }

    // Add user if not exists
    db.prepare(
      "INSERT OR IGNORE INTO users (id, username, points) VALUES (?, ?, 0)"
    ).run(user.id, user.username);

    // Update points
    db.prepare("UPDATE users SET points = points + ? WHERE id = ?").run(
      points,
      user.id
    );

    message.channel.send(
      `${user.username} has been awarded ${points} points! 🏆`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
