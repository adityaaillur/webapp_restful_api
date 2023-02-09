module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User",{
        id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true,
            readOnly:true,
            validate: {
                notEmpty:true
            }
        },
        firstName:{
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
                notEmpty:true
            }
        },
        lastName:{
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
                notEmpty:true
            }
        },
        username:{
            type:DataTypes.STRING,
            allowNull:false,
            unique:true,
            validate: {
                notEmpty:true
            }
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false,
            writeOnly:true,
            validate: {
                notEmpty:true
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
            readOnly: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
            readOnly: true
        },
        
    },
    {
        hooks: {
          beforeCreate: (user, options) => {
            user.createdAt = new Date();
            user.updatedAt = new Date();
          },
          beforeUpdate: (user, options) => {
            user.updatedAt = new Date();
          }
        }
    }, 
    {
        timestamps: false
    })

    return User;
}