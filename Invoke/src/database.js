const sql = require('mssql')
const dbConfig = require("./dbConfig")

class Database {
    static async runQuery(query) {
        try {
            const config = await dbConfig.getDBConfig();
            console.log(config);
            await sql.connect(config);
            console.log('connected')
            const result = await sql.query(query)
            sql.close()
            return result["recordset"]
        } catch (e) {
            //slack.notifyError(e);
            throw e
        }
    }
}
module.exports = Database



// const sql = require('mssql')
// const dbConfig = require("./dbConfig")

// class Database {
//     static async runQuery(query) {
//         try {
//             await sql.connect(dbConfig.configuration)
//             const result = await sql.query(query)
//             sql.close()
//             return result["recordset"]
//         } catch (e) {
//             //slack.notifyError(e);
//             throw e
//         }
//     }
// }
// module.exports = Database