const axios = require("axios");

exports.run = async (client, message) => {
  const serverIndicator = message.content
    .toLowerCase()
    .match(/^([a-z]{2})([0-9]{1,3})$/);

  if (!serverIndicator)
    return message.channel.send(
      `Please enter valid world (eg. en100). ${message.content} is not valid world.`
    );
  const serverShortcut = serverIndicator[1];
  const serverNumber = serverIndicator[2];

  const world = await axios
    .get(`${process.env.BACKEND_URL}/world/active`)
    .then(response => {
      const { data } = response;

      const server = Object.values(data).find(
        server => server.server === serverShortcut
      );

      if (!server) return false;

      return Object.values(server.worlds).find(
        world => world.val === serverNumber
      );
    });

  if (!world)
    return message.channel.send(
      `World ${serverShortcut}${serverNumber} was not found.`
    );

  await axios
    .get(
      `${process.env.BACKEND_URL}/discord/set_server?guild=${message.guild.id}&server=${message.content}`
    )
    .then(() => {
      message.reply(
        `\`Server for this guild was successfully set to ${message.content}\``
      );
    })
    .catch(error => {
      const { data } = error.response;

      message.reply(`\`${data.message}\``);
    });
};

exports.config = {
  aliases: ["setserver", "setServer", "set_server"]
};
exports.settings = {
  name: "server"
};