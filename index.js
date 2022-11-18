const express = require('express')
// var bodyParser = require('body-parser');  
// Create application/x-www-form-urlencoded parser  
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

var cors = require('cors')

var mysql = require('mysql');

const port = 3000;

const DB_HOST = 'imahudo-1.cgs2gse1hjxz.us-east-1.rds.amazonaws.com';
const DB_USER = 'admin';
const DB_PASSWORD = 'Imahudo001!'

const con = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD
});

function validateID(theIDnumber) {
  var ex = /^(((\d{2}((0[13578]|1[02])(0[1-9]|[12]\d|3[01])|(0[13456789]|1[012])(0[1-9]|[12]\d|30)|02(0[1-9]|1\d|2[0-8])))|([02468][048]|[13579][26])0229))(( |-)(\d{4})( |-)(\d{3})|(\d{7}))/;

  console.log(theIDnumber);
  return ex.test(theIDnumber);
}

app.get('/', (req, res) => {
  res.send('Hello World Liberty!')
})

app.options('/record', (request, response) => {
  response = returnCORS(response);
});

/* Producer */
app.post('/record', cors(), function (req, res) {  

  const IDNumber = req.body.IDNumber;
  const Name = req.body.Name;
  const LastName = req.body.LastName;
  
  console.log(`IDNumber: ${IDNumber}`);
  console.log(`Name: ${Name}`);
  console.log(`LastName: ${LastName}`);

  // /* Check validity of input data */
  // if (!validateID(IDNumber)) {
  //   res.send('Invalid ID');
  //   return;
  // }

  /* Check if record already exists */

  var sql = `INSERT INTO imahudo_db.health_data (IDNumber, Name, Surname) VALUES ('${IDNumber}', '${Name}', '${LastName}')`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });

  res.send({
    'IDNumber': IDNumber,
    'Name': Name,
    'LastName': LastName
  });
})

app.options('/api/records', (request, response) => {
  response = returnCORS(response);
});

/* Consumer */
app.get('/api/records', async (req, res) => {
  let response = [];

  /* Extend the input - query by different parameters */

  const sql = 'select * from imahudo_db.health_data';

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Result: " + result.length);
    for (var i=0; i < result.length; i++) {
      const record = result[i];
      console.log(record['Name']);

      response.push(record);
    }

    /* Update his itemised statement */
    /* Must understand why pre-flight is not made */
    res.set('Access-Control-Allow-Origin', '*');
    res.send(response);
  });    
})

app.listen(port, () => {
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

  console.log(`Example app listening on port ${port}`)
})

/************************************************************/
/* INTERNAL FUNCTIONS                                       */
/************************************************************/
function returnCORS(response) {
  var _responseCode = 200;
  var _responseData = {};

  try {
      response.set('Access-Control-Allow-Origin', '*');
      response.set('Access-Control-Allow-Credentials', 'true');

      // Send response to OPTIONS requests
      response.set('Access-Control-Allow-Methods', 'POST, GET');
      response.set('Access-Control-Allow-Headers', '*');
      _responseCode = 204;
      _responseData = '';
  }
  catch (err) {
      console.error(err);
  }
  finally {
      console.log(_responseData, { _responseCode: _responseCode });
      response.status(_responseCode).send(_responseData);
  }
  return response;
}
