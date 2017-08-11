var crypto = require('crypto');
var ObjectId = require('mongodb').ObjectId;
var collectionName = 'providers';
var _database;

class Provider {
  // LOGIN
  login(request, response) {
    let payload = {};
    // find user with email
    _database.collection(collectionName).findOne({ 'email': request.body.email }).then((data) => {
      if (data) {
        // if user exists
        // authenticate and respond with result
        payload.doesUserExist = true;
        payload.isUserAuthenticated = data.credentials.hash === crypto.pbkdf2Sync(request.body.password, data.credentials.salt, 1000, 64).toString('hex');
        response.status(200).json(payload);
      } else { // if user does not exist
        // respond with authentication failure
        payload.doesUserExist = false;
        response.status(200).json(payload);
      }
    });
  }
  // REGISTER
  register(request, response) {
    let payload = {};
    // check if user already exists first
    _database.collection(collectionName).findOne({ 'email': request.body.email }).then((data) => {
      if (data) {
        // if user already exists
        // respond with registration failure
        payload.doesUserExist = true;
        response.status(200).json(payload);
      } else {
        // if user does not exist
        // register
      }
    });
  }

  // getVendors(request, response) {
  //   _database.collection(collectionName).find({}).toArray((error, data) => {
  //     response.status(200).json(data);
  //   });
  // }
  // searchVendors(request, response) {
  //   let regex = new RegExp(request.params.input, 'i');
  //   let searchInput = [
  //     {'username': { $regex: regex }},
  //     { 'firstname': { $regex: regex }},
  //     {'lastname': { $regex: regex }}
  //   ];
  //   let options = {
  //     'username': true,
  //     'firstname': true,
  //     'lastname': true,
  //   };
  //   _database.collection(collectionName).find({ $or: searchInput }, options).toArray((error, data) => {

  //     response.status(200).json(data); 
  //   });
  // }
  // getVendorServices(request, response) {
  //   _database.collection(collectionName).findOne({ '_id': ObjectId(request.params.id) }, { 'services': true }).then((data) => {
  //     response.status(200).json(data);
  //   })
  // }
  // getVendorAppointments(request, response) {
  //   _database.collection(collectionName).findOne({ '_id': ObjectId(request.params.id) }, { 'appointments': true }).then((data) => {
  //     response.status(200).json(data);
  //   });
  // }
  // addServiceToVendor(request, response) {
  //   let service = {
  //     name: request.body.name,
  //     cost: request.body.cost,
  //     duration: request.body.duration,
  //     serviceId: crypto.randomBytes(16).toString('hex')
  //   }
  //   _database.collection(collectionName).updateOne({ '_id': ObjectId(request.body.id) }, { $push: { services: service } }).then((data) => {
  //     _database.collection(collectionName).findOne( { '_id': ObjectId(request.body.id) }, { 'services': true }).then((data) => {
  //       response.status(200).json(data);
  //     })
  //   })
  // }
  // authenticateVendor(request, response) {
  //   // collects information regarding authentication
  //   let authInfo = {
  //     doesUserExist: false,
  //     isUserAuthenticated: false,
  //   };
  //   _database.collection(collectionName).findOne({ "email": request.body.email }).then((data) => {
  //     // Check if user exists
  //     if (data) {
  //       // user exists, proceed to authentication
  //       authInfo.doesUserExist = true;
  //       if (data.credentials.hash === crypto.pbkdf2Sync(request.body.password, data.credentials.salt, 1000, 64).toString('hex')) {
  //         // authentication success
  //         authInfo.isUserAuthenticated = true;

  //         // generate token 
  //         authInfo.token = crypto.randomBytes(16).toString('hex');
  //         authInfo.id = data._id;
  //         _database.collection(collectionName).updateOne({ '_id': data._id }, { $set: { 'token': authInfo.token, 'sessionExpiration': (Date.now() + sessionDuration) } });
  //       }
  //     }
  //     // respond with authentication information
  //     response.status(200).json(authInfo);
  //   }, (error) => {
  //     response.status(400).json(false);
  //   });
  // }
  // registerVendor(request, response) {
  //   let regInfo = {
  //     doesUserExist: false,
  //     registrationSuccess: false
  //   };
  //   _database.collection(collectionName).findOne({ 'email': request.body.email }).then((data) => {
  //     if (data) {
  //       regInfo.doesUserExist = true;
  //       response.status(200).json(regInfo);
  //     } else {
  //       let salt = crypto.randomBytes(16).toString('hex');
  //       let userRecord = {
  //         username: request.body.username,
  //         email: request.body.email,
  //         credentials: {
  //           salt: salt,
  //           hash: crypto.pbkdf2Sync(request.body.password, salt, 1000, 64).toString('hex')
  //         },
  //         firstname: request.body.firstname,
  //         lastname: request.body.lastname,
  //         services: [],
  //         appointments: []
  //       };
  //       _database.collection(collectionName).insertOne(userRecord).then((data) => {
  //         regInfo.registrationSuccess = true;
  //         regInfo.email = request.body.email;
  //         regInfo = request.body.password;
  //         response.status(201).json(regInfo);
  //       }, (error) => {
  //         regInfo.registrationSuccess = false;
  //         response.status(400).json(regInfo);
  //       });
  //     }
  //   }); 
  // }
  // checkSession(request, response) {
  //   var isSessionDone = false;
  //   _database.collection(collectionName).findOne({ '_id': ObjectId(request.body.id) }, { 'sessionExpiration': true, 'token': true }).then((data) => {
  //     if (data.token === request.body.token) {
  //       if (Number(data.sessionExpiration) < Date.now()) {
  //         isSessionDone = true;
  //         // eliminate token
  //         _database.collection(collectionName).updateOne({ '_id': ObjectId(request.body.id) }, { $set: { 'token': crypto.randomBytes(16).toString('hex') } } );
  //         _data
  //       } else {
  //         isSessionDone = false;
  //         // reset session expiration, 10 more minutes
  //         _database.collection(collectionName).updateOne({ '_id': ObjectId(request.body.id) }, { $set: { 'sessionExpiration': (Date.now() + sessionDuration) } } );
  //       }
  //     }
  //     response.status(200).json(isSessionDone);
  //   });
  // }
  setDatabase(database) {
    _database = database;
  }
}

const provider = new Provider();
module.exports = provider;