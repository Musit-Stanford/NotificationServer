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
var conversationRef = db.ref('conversations')
var usersDataRef = db.ref('usersData')
ref.orderByChild('timestamp').startAt(Date.now()).on('child_added', (messageSnapshot) => {
  var message = messageSnapshot.val();
  conversationRef.child(message.conversationId).once('value', (conversationSnapshot) => {
    var conversation = conversationSnapshot.val();
    var userIds = Object.keys(conversation.users).filter((userId) => userId !== message.userId)
    for (var i = userIds.length - 1; i >= 0; i--) {
      var userId = userIds[i];
      usersDataRef.child(userId).once('value', (userSnapshot) => {
        var user = userSnapshot.val()
        var registrationToken = user.registrationToken;
        var payload = {
          notification: {
            title: "New rec from " + message.userName,
            body: message.track
          }
        };
        admin.messaging().sendToDevice(registrationToken, payload, {show_in_foreground: true})
        .then(function(response) {
          // See the MessagingDevicesResponse reference documentation for
          // the contents of response.
          console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
          console.log("Error sending message:", error);
        });
      });
    }
  });
});

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})