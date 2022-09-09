require("dotenv").config()
const { Sequelize } = require("sequelize") 
const { DataTypes } = require("sequelize")

const sequelize = new Sequelize(process.env.MYSQL_URI)

async function testConnecton () {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnecton()  


const User = sequelize.define('User', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}) 

const Invoice = sequelize.define('Invoice', {
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId:{
        type: DataTypes.INTEGER,
    },
}) 

const invoiceTable = async () => {
    await sequelize.sync()
    try {
        await Invoice.create({
            amount: 100,
            userId: 2
        })
        console.log("Invoice successfully created")
    } catch (error) {
        console.log(error)
        await sequelize.close();
    }
}

const usersTable = async () => {
    await sequelize.sync()
    try {
        await User.create({
            firstName: 'Tess'
        })
        console.log("User successfully created")

    await sequelize.close();

    } catch (error) {
        console.log(error)
        await sequelize.close();
    }
}

usersTable()
invoiceTable()