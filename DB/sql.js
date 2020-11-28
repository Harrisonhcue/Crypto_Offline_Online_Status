let tableName = 'offline_elapsed_time'

let getAllElapsedTime = `
SELECT 
    id,
    atm_identifier as atm_id,
    inconsistent as state,
    offline_start, 
    offline_end
FROM 
    offline_elapsed_time`


let getElapsedTimeByATMId = `
SELECT 
    id,
    atm_identifier,
    inconsistent,
    offline_start, 
    offline_end
FROM 
    offline_elapsed_time 
WHERE 
    atm_identifier = ?

ORDER BY ID DESC    
        `


let insertATMStatus = `INSERT INTO ${tableName} VALUES(?,?,?,?,?) `

let updateATMStatus = `
                        UPDATE ${tableName}
                        SET 
                            atm_identifier = ? , 
                            inconsistent = ? , 
                            offline_start = ? , 
                            offline_end = ? 
                            
                        WHERE id = ? AND atm_identifier = ? ;`

module.exports = {
    getAllElapsedTime,
    getElapsedTimeByATMId,
    insertATMStatus,
    updateATMStatus
}