 var config = {
     apiKey: "AIzaSyDlaNFRtlrwBIhCZH7a7XPQ4Sh9E4OVaNk",
     authDomain: "bottletracker-cdf87.firebaseapp.com",
     databaseURL: "https://bottletracker-cdf87.firebaseio.com",
     projectId: "bottletracker-cdf87",
     storageBucket: "",
     messagingSenderId: "175329179179"
 };
 firebase.initializeApp(config);

 var userEmail;
 var userId;
 var database = firebase.database();
 var provider = new firebase.auth.GoogleAuthProvider();
 var dbOnceJustCalled;

 var localUserId = localStorage.getItem("userId");

 if (localUserId != null) {
     userId = localUserId;
     dbStuff();
 } else {
     firebase.auth().signInWithPopup(provider).then(function(result) {
         var token = result.credential.accessToken;
         var user = result.user;
         userEmail = user;
         userId = user.uid;
         localStorage.setItem("userId", userId);
         dbStuff();
     }).catch(function(error) {
         var errorCode = error.code;
         var errorMessage = error.message;
         var email = error.email;
         var credential = error.credential;
         console.log(error);
     });
 }
 $(document).ready(function() {
     $("#datetimepicker").datetimepicker();
     $("#submit").on("click", function() {
         dbOnceJustCalled = false;
         var amount = $("#amount").val();
         var dateTime = $("#dateTime").val();
         var bottleRecord = new BottleRecord(amount, dateTime);
         persistRecord(bottleRecord);
     });

     function BottleRecord(amount, dateTime) {
         this.amount = amount;
         this.dateTime = dateTime;
     }

     function persistRecord(object) {
         database.ref("/userId:" + userId).push(object);
     }

     function dbStuff() {
         database.ref().once("value").then(function(childSnapshot) {
             dbOnceJustCalled = true;
             if (childSnapshot.val() !== null) {
                 var userRecordKey = "userId:" + userId;
                 var wholearr = childSnapshot.val()[userRecordKey];
                 var keyArray = Object.keys(wholearr);

                 keyArray.forEach(function(element) {
                     $("#results").prepend("<tr><td>" + wholearr[element].amount +
                         " </td><td> " + wholearr[element].dateTime + "</td></tr>");
                 });
             }
         }, function(errorObject) {
             console.log("Errors handled: " + errorObject.code);
         });

         database.ref("/userId:" + userId).orderByKey().limitToLast(1).on("child_added", function(snapshot) {
             if (dbOnceJustCalled === false) {
                 $("#results").prepend("<tr><td>" + snapshot.val().amount +
                     "</td><td>" + snapshot.val().dateTime + "</td></tr>");
             }
         });
     }
 });