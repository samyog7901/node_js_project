// Yaha Databaseko configuration ko code hunxa
const dbConfig = {
    db : "railway",//in this way we access data from .env file
    username : "root",
    password : "pdDIBgpNNmZWddIkIiWOZQCpOYczpgsX",
    host : "turntable.proxy.rlwy.net",
    // port : 39014,
    dialect : "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}

module.exports = dbConfig  //exporting the database config to use in other files