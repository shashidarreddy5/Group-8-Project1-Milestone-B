const mysql = require('mysql');
const {db_config} = require("./config.json")
const database =db_config
database.database = "myhobbay"

const connect = () => {
    const conn = mysql.createConnection(database);

    //connect to database
    conn.connect((err) => {
        if (err) throw err;
        console.log('Mysql Connected...');
    });
    return conn
}

const tables_create = (tables) => {

}

module.exports = {
    connect
}