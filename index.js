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

//The Invoices table stores the userId of the user who created the invoice row.
//id is the primary key in the users table and the forigen key in invoices table 

//id is called userId in the invocies table

//The first method to query both table data at once is by writing a raw SQL query using


const rawJoin = async () => {
    const [results] = await sequelize.query (
        "SELECT * FROM Invoices JOIN Users ON Invoices.userId = Users.id"
    )
    console.table(results.map(value => value))
}
// rawJoin()

// There are four types of association methods that you can use in Sequelize:
// hasOne()
// hasMany()
// belongsTo()
// belongsToMany()
// These four methods can be used to create One-To-One, One-To-Many, and Many-To-Many relationships between your models. 

// In the example we have, one User row can have many Invoices rows. This means you need to create a One-To-Many relation between the Users and the Invoices table.
///////////////////////////////////

const sequelizeJoin = async () => {
    User.hasMany(Invoice)
    Invoice.belongsTo(User)

     // By default, the include option will cause Sequelize to generate an SQL query with the LEFT OUTER JOIN clause.

    const leftOuterJoin = await User.findAll({
        include: Invoice
    })

    console.log(JSON.stringify(leftOuterJoin, null, 2)) 

    //To change the JOIN clause from LEFT OUTER JOIN to INNER JOIN, 
    //you need to add the required: true option to the include option.

    const innerJoin = await User.findAll({
        include: {model: Invoice, required: true }
    })

    //With an INNER JOIN, the data from the Users row will 
    //be excluded when there are no related Invoices data for that row.
    
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



