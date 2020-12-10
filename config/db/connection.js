const mysql = require('mysql');
let db;

let databaseToUse = function() {
  if (process.env.NODE_ENV === 'test') {
    return 'database_cleaner';
  }
  return `${process.env.DB_NAME}_${process.env.NODE_ENV}`;
}

module.exports = {
  connectDatabase: function() {
    if (!db) {
      db = mysql.createConnection({
      host     : process.env.DB_HOST,
      user     : process.env.DB_USERNAME,
      password : process.env.DB_PASSWORD,
      database : databaseToUse()
      });

      db.connect(err => {
        if(!err) {
          console.log('Database is connected!');
        } else {
          console.log(err);
          console.log('Error connecting database!');
        }
      });
    }
    return db;
  }
}