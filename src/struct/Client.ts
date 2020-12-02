import TypeORM from "typeorm"
import Discord from "discord.js"
import EventList from "./client/EventList"
import CommandList from "./client/CommandList"
import ConfigManager from "./client/ConfigManager"
import createLogger from "@buildtheearth/bot-logger"

export default class Client /**/ extends Discord.Client {
    db: TypeORM.Connection
    logger = createLogger({ filePath: __dirname + "/../../logs/" })
    config = new ConfigManager()
    events = new EventList(this)
    commands = new CommandList()
    aliases = new Discord.Collection()

    async initDatabase() {
        this.db = await TypeORM.createConnection({
            type: "mysql",
            host: this.config.db.host,
            database: this.config.db.name,
            username: this.config.db.name,
            password: this.config.db.pass,
            entities: [__dirname + "/../entities/*.js"],
            synchronize: true
        })
    }

    login(): Promise<string> {
        return super.login(this.config.token)
    }
}
