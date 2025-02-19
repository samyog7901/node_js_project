//Database Connection
const  {Sequelize,DataTypes} = require('sequelize')
const databaseConfig = require('../config/dbConfig')
const makeBlogTable = require('./blogModel')
const makeUserTable = require('./userModel')
const makeCommentTable = require('./commentModel')


const sequelize = new Sequelize(databaseConfig.db,databaseConfig.username,databaseConfig.password,{
    host : databaseConfig.host,
    port : 39014,
    dialect : databaseConfig.dialect,
    operatorsAliases : false,
    pool :{
        max : 5,
        min : 0,
        acquire : 30000,
        idle : 10000
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