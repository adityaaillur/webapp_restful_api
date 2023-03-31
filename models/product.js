const {User} = require('./user')
module.exports = (sequelize, DataTypes) => {
    const Product = sequelize.define("Product",{
        id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true,
            readOnly: true,
            validate: {
                notEmpty:true
            }
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
                notEmpty:true
            }
        },
        description:{
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
                notEmpty:true
            }
        },
        sku:{
            type:DataTypes.STRING,
            allowNull:false,
            unique: true,
            validate: {
                notEmpty:true
            }
        },
        manufacturer:{
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
                notEmpty:true
            }
        },
        quantity:{
            type:DataTypes.INTEGER,
            allowNull:false,
            validate: {
                notEmpty:true
            }
        },
        date_added: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
            readOnly: true
        },
        date_last_updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
            readOnly: true
        },
        owner_user_id: {
            type: DataTypes.INTEGER,
            // references: {
            //   model: User,
            //   key: 'id',
            // readOnly: true, 
            // }
        }   
    },{
        timestamps: false
    })

    // Product.associate = models => {
    //     Product.belongsTo(models.User, {
    //         foreignKey: {
    //             allowNull: false
    //         }
    //       }); 
    // }

    return Product;
}