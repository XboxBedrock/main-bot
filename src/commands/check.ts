import Discord from "discord.js"
import Client from "../struct/Client"
import Guild from "../struct/discord/Guild"
import Command from "../struct/Command"
import Roles from "../util/roles"
import ActionLog from "../entities/ActionLog"

export default new Command({
    name: "check",
    aliases: ["history", "logs", "records"],
    description: "Check a user's punishment records.",
    permission: [Roles.HELPER, Roles.MODERATOR],
    usage: "<user>",
    async run(this: Command, client: Client, message: Discord.Message, args: string) {
        const { member, input } = await (<Guild>message.guild).members.find(args)

        if (!member) {
            return message.channel.send({
                embed: {
                    color: client.config.colors.error,
                    description:
                        member === undefined
                            ? `Couldn't find user \`${input}\`.`
                            : `You must provide a user to check!`
                }
            })
        }

        const actionLogs = await ActionLog.find({ where: { member: member.id } })
        const categorizedLogs: {
            [key: string]: ActionLog[]
        } = { warn: [], mute: [], kick: [], ban: [], unmute: [], unban: [] }

        const fields: { name: string; value: string; inline: boolean }[] = []
        for (const log of actionLogs) categorizedLogs[log.action].push(log)
        for (const [action, logs] of Object.entries(categorizedLogs)) {
            // prettier-ignore
            const name = `${action[0].toUpperCase() + action.slice(1) + "s"} (${logs.length})`
            // prettier-ignore
            const value = logs.map(log => `\` ${log.id}. \` ${log.reason}`).join("\n") || "\u200B"
            fields.push({ name, value, inline: true })
        }

        message.channel.send({
            embed: {
                color: client.config.colors.success,
                thumbnail: {
                    url: member.user.displayAvatarURL({ size: 64, format: "png" })
                },
                description: `Punishment logs for ${member}:`,
                fields
            }
        })
    }
})