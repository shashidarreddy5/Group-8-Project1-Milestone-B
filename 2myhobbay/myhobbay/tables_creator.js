const mysql = require('mysql');
const {tables} = require('./tables.json');
const {db_config} = require("./config.json")
const database =db_config

const connect = () => {
    const conn = mysql.createConnection(database);

    conn.connect((err) => {
        if (err) throw err;
        console.log('Mysql Connected...');
    });
    return conn
}

const tables_create = (tables) => {

}
conn = connect()


const create_database_table=(sql)=>{
	conn.query("USE myhobbay", (err,db)=>{
		if(err){
			console.log(err)
		}else{
			
			conn.query(sql,function(err, result){
			if (err) {
				throw err
			}else{
				console.log(""+sql)
			}

		})
		}
	})
}
conn.query("CREATE DATABASE IF NOT EXISTS myhobbay;", (err,msg)=>{
	if(err){
		console.log(err)
	}else{
		for (t in tables){
			table = tables[t]
			sql = `CREATE TABLE IF NOT EXISTS \`${table.name}\` (`
			const ln = table.filds.length -1
			for(f in table.filds){
				fld = table.filds[f]
				sql+=fld.name +" " + fld.type;
				if (f < ln){
					sql+= ", "
				}else{
					sql+=")"
				}
			}
			sql+=";"
			create_database_table(sql)
		
	}
	}
})


