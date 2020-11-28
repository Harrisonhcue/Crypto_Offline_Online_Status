const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('DB/assessment.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    return console.error("Error accessing assessment DB: \n" + err.message);
  }
  console.log('Connected to assessment.db');
});


db.query = function (sql, params) {
  var that = this;
  return new Promise(function (resolve, reject) {
    that.all(sql, params, function (error, rows) {
      if (error)
        reject(error);
      else
        resolve({
          rows: rows
        });
    });
  });
};


module.exports = db