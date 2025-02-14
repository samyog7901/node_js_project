const makeCommentTable = (sequelize,DataTypes) => {
    const Comment = sequelize.define('comment',{
        commentMessage : {
            type : DataTypes.STRING,
            allowNull : false
        }
    })
    return Comment
}

module.exports = makeCommentTable  //exporting the function to use in other files