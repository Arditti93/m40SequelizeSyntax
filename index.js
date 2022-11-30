require("dotenv").config()
const { Sequelize } = require("sequelize") 
const { DataTypes } = require("sequelize")

//Making a connection
const sequelize = new Sequelize(process.env.MYSQL_URI)

//Testing databse connection using sequelize authenticate method
const testConnecton = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnecton()  

//Defining our tables
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

//Create adding entries to our tables
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

// usersTable()
// invoiceTable()

const displayTables = async () => {
    try {
        //filter findAll to only output the id and firstName column from the Users table
        let usersList = await User.findAll({
            attributes: ['id', 'firstName']
        })
        //Display Users table as table in the console
        console.table(usersList.map(value => value.dataValues)) 

        //filter findAll to only output the id, amount and userId from the invoices table
        let invoiceList = await Invoice.findAll({
            attributes: ['id', 'amount', 'userId']
        })
        //Invoices table in a console table
        console.table(invoiceList.map(value => value.dataValues)) 

    } catch (error) {
        await sequelize.close()
        console.log(error)
    }
}

displayTables()


const rawJoin = async () => {
    const [results] = await sequelize.query (
        "SELECT * FROM Invoices JOIN Users ON Invoices.userId = Users.id"
    )
    console.table(results.map(value => value))
}
// rawJoin()

///////////////////////////////////

const sequelizeJoin = async () => {
    User.hasMany(Invoice)
    Invoice.belongsTo(User)

    // const leftOuterJoin = await User.findAll({
    //     include: Invoice
    // })

    // console.log(JSON.stringify(leftOuterJoin, null, 2)) 


    const innerJoin = await User.findAll({
        include: {model: Invoice, required: true }
    })

    console.log(JSON.stringify(innerJoin, null, 2))
}
//  sequelizeJoin()

//add invoice for a user called Alice 
const addInvoice = async () => {
    //find userid of user
    let userId = await User.findAll({
        where: {
            firstName: 'Alice'
        },
        attributes: ['id']
    })

    let id = userId[0].dataValues.id
    await Invoice.create({
        amount: 400,
        userId: id
    })
    console.log("Invoice successfully created") 

    let findInvoice = await Invoice.findAll({
        where: {
            userId: id
        }
    })
    console.table(findInvoice.map(value => value.dataValues)) 

}
addInvoice() 



