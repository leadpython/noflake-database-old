var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require('mongodb');
var routes = require('./routes/api');
var app = express();

var Provider = require('./routes/providers.route');

app.use(bodyParser.json());
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
app.use('/api', routes);

mongodb.MongoClient.connect(process.env.MONGODB_URI, function(error, database) {
  Provider.setDatabase(database);
  app.listen(process.env.PORT || 8080, function () {
    console.log("App now running!");
  });
});

