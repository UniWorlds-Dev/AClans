const cmds_list = [
    {
        name: "test",
        out: (client, msg) => {
            msg.reply({
                content: `Gay?`
            })
        },
        about: "test"
    }
];

module.exports = cmds_list;
