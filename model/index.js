//Database Connection
const dbConfig = require('../config/dbConfig')
const  {Sequelize,DataTypes} = require('sequelize')

const makeBlogTable = require('./blogModel')
const makeUserTable = require('./userModel')
const makeCommentTable = require('./commentModel')

// la sequelize yo config haru lag ani database connect gardey vaneko hae 
const sequelize = new Sequelize(dbConfig.db,dbConfig.username,dbConfig.password,{
    host : dbConfig.host,
    port : 39014,
    dialect : dbConfig.dialect,
    operatorsAliases : false,
    pool: {
        max: dbConfig.pool.max,
        min: dbConfig.pool.min,
        acquire: dbConfig.pool.acquire,
        idle: dbConfig.pool.idle,
    }
})

sequelize.authenticate()
.then(()=>{
    console.log('database connected')
})
.catch((err)=>{
    console.log("error aayo hai",err)
})

const db = {}
db.Sequelize = Sequelize //naksa(class) ra
db.sequelize = sequelize//ghar lai db vanne object ma rakheko

// importing model files
db.blogs = makeBlogTable(sequelize,DataTypes) //function call
db.users = makeUserTable(sequelize,DataTypes)
db.comments = makeCommentTable(sequelize,DataTypes)

// relationship
db.users.hasMany(db.blogs)
db.blogs.belongsTo(db.users)

db.users.hasMany(db.comments)
db.comments.belongsTo(db.users)

db.blogs.hasMany(db.comments)
db.comments.belongsTo(db.blogs)

db.sequelize.sync({force : false}).then(()=>{
    console.log('Synced done!!')
})

module.exports = db