const makeBlogTable = (sequelize,DataTypes) => {
    const Blog = sequelize.define('blog',{
        title : {
            type : DataTypes.STRING,
            allowNull : false
        },
        subtitle : {
            type : DataTypes.STRING,
            allowNull : false
        },
        description :{
            type : DataTypes.TEXT,
            allowNull : false
        },
        image : {
            type : DataTypes.STRING,
        },
        userId : {
            type : DataTypes.INTEGER,
            allowNull : false
        }
    })
    return Blog
}

module.exports = makeBlogTable;  //exporting the function to use in other files