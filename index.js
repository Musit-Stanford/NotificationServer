var express = require('express')
var app = express()
var admin = require("firebase-admin");

var serviceAccount = require("./musit-ebe2c-firebase-adminsdk-usxes-34888db635.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://musit-ebe2c.firebaseio.com"
});

var db = admin.database()
var ref = db.ref('messages')

ref.orderByChild('createdAt').endAt(Date.now()).on('child_added', function(snapshot) {
  console.log('new record', snapshot.key);
});

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})