module.exports = (sequelize, DataTypes) => {
    const Images = sequelize.define("Images",{
        image_id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            autoIncrement:true,
            primaryKey:true,
            readOnly: true,
            validate: {
                notEmpty:true
            }
        },
        product_id:{
            type:DataTypes.INTEGER,
            allowNull:false,
            validate: {
                notEmpty:true
            }
        },
        file_name:{
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
                notEmpty:true
            }
        },
        date_created: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.fn('NOW'),
            readOnly: true
        },
        s3_bucket_path:{
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
                notEmpty:true
            }
        },
    },{
        timestamps: false
    })
    return Images;
}