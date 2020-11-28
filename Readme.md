
# Localcoin API 

Submission for Localcoin consideration.

## Installation

Navigate to the root directory of this project. 
Run the command below to install the libraries required for this project

```bash
npm install 
```

## Start API server
  
```bash
npm start 
```
Default port is :7775 

## Output
API listening on port 7775

Connected to assessment.db

## Request

```javascript
curl -v --header "Content-Type: application/json" --request POST --data '{"notification_type":"offline_start","value":"2019-11-25 17:17","atm_identifier":"BT10000"}' http://localhost:7775/atm/notification
```


## Response

```json
< HTTP/1.1 200 OK
< X-Powered-By: Express
< Content-Type: application/json; charset=utf-8
< Content-Length: 61
< Date: Fri, 27 Nov 2020 22:28:43 GMT
< Connection: keep-alive
< 
* Curl_http_done: called premature == 0
* Connection #0 to host # left intact
{"message":"Accepted, Consistency Status inserted row id:12"}'
```

## Author
Harrison U-Ebili

