const express = require('express')
const bodyParser = require('body-parser');

const app = express();
const port = 7775;

var rootPath = require('path').resolve(__dirname, '..');

//Database module with sqllite connection to assessment db 
const db = require(rootPath + '/DB/db.js')

//SQL module containing literal SQL statements 
const QUERY = require(rootPath + '/DB/sql.js')

//Add express middleware 
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(bodyParser.json());

//API path to post notification
app.post('/atm/notification', (req, res) => {

  var process = processNotification(req.body)
  if (process) {
    console.log("Post notification for device:" + req.body.atm_identifier)

    let notification_type = req.body.notification_type

    let atm_id = req.body.atm_identifier

    //Reference the latest entry for the requested atm machine
    var latest_entry = {}
    //Path for offline start notifications
    if (notification_type.trim() === 'offline_start') {

      //Retrieve latest entry for current atm machine
      db.query(QUERY.getElapsedTimeByATMId, atm_id, function (err, row) {
        console.log(row);
      }).then(queryRes => {

        latest_entry = queryRes.rows[0]
        var updateRecord = false

        if (latest_entry) {
          //Determine if the latest entry sholuld be updated or not 
          updateRecord = isConsistent(latest_entry)
        }


        if (updateRecord) {

          //Update row by flagging it as inconsistent
          var qParams = [latest_entry.atm_identifier, 1, latest_entry.offline_start, latest_entry.offline_end, latest_entry.id, latest_entry.atm_identifier]
          db.run(QUERY.updateATMStatus, qParams, function (err) {
            if (err) {
              return res.status(400).json({
                message: "Error updating consistency status\n" + err
              });
            }

          })
        }
        //Insert new row with offline_start , null offline_end, inconsistent 0 and atm identifier
        var qParams = [req.body.atm_identifier, 0, req.body.value, "", ]
        db.run(QUERY.insertATMStatus, qParams, function (err) {
          if (err) {
            return res.status(400).json({
              message: "Error inserting new consistency status\n" + err
            });

          }
          res.status(200).json({
            message: `Accepted, Consistency Status inserted row id:${this.lastID}`
          });
        })


      })

    }

    //Path for offline end notifications
    else if (notification_type.trim() == 'offline_end') {
      //Retrieve latest entry for current atm machine
      db.query(QUERY.getElapsedTimeByATMId, atm_id, function (err, row) {
        console.log(row);
      }).then(queryRes => {


        latest_entry = queryRes.rows[0]
        var updateRecord = false

        if (latest_entry) {
          //Determine if the latest entry sholuld be updated or not 
          updateRecord = isConsistent(latest_entry)
        }


        var offline_end = Date.parse(req.body.value)
        var offline_start = Date.parse(latest_entry.offline_start)

        if (updateRecord) {

          if (offline_end > offline_start) {
            //Update current row with received end time
            db.run(QUERY.updateATMStatus, [latest_entry.atm_identifier, 0, latest_entry.offline_start, req.body.value, latest_entry.id, latest_entry.atm_identifier], function (err) {
              if (err) {
                return res.status(400).json({
                  message: "Error updating consistency status\n" + err
                });
              }
              res.status(200).json({
                message: `Consistency Status updated row id:${latest_entry.id}`
              });
            })
          } else {

            db.run(QUERY.insertATMStatus, [req.body.atm_identifier, 1, "", req.body.value, ], function (err) {
              if (err) {
                return res.status(400).json({
                  message: "Error inserting new consistency status\n" + err
                });

              }
              res.status(200).json({
                message: `Consistency Status inserted row id:${this.lastID}`
              });
            })
          }

        } else {
          db.run(QUERY.insertATMStatus, [req.body.atm_identifier, 1, "", req.body.value, ], function (err) {
            if (err) {
              return res.status(400).json({
                message: "Error inserting new consistency status\n" + err
              });

            }
            res.status(200).json({
              message: `Consistency Status inserted row id:${this.lastID}`
            });
          })
        }
      })
    } else {
      console.log("Unknown notification type")
      res.status(400).json({
        message: "Unknown notification type",
        known_types: "[offline_start, offline_end]"
      });
    }
  } else {
    //Return error with required parameters for request
    res.status(400).json({
      message: "Invalid / Missing request parameters ",

    });
  }
})


function isConsistent(record) {

  if (record.inconsistent == 0 && record.offline_start.trim() !== '' && record.offline_end.trim() === '') {
    return true
  }
  return false
}
app.listen(port, () => {
  console.log(`API listening on port ${port}`)
});

//Checks the contents of req.body before processing
function processNotification(params) {
  //Verify all parameters have contents
  if (params.notification_type.trim() === '' || params.value.trim() === '' || params.atm_identifier.trim() === '') {
    return false
  } else if (isNaN(Date.parse(params.value.trim()))) { //Verify date supplied is valid
    return false
  } else {
    return true
  }

}