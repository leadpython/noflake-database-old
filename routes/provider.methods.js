var crypto = require('crypto');
var ObjectId = require('mongodb').ObjectId;
var providerCollection = 'providers';
var employeeCollection = 'employees';
var appointmentsCollection = 'appointments';
var _database;

class Provider {
  // LOGIN
  login(request, response) {
    let payload = {};
    // find user with email
    _database.collection(providerCollection).findOne({ 'email': request.body.email }).then((data) => {
      if (data) {
        // if user exists
        // authenticate and respond with result
        payload.doesUserExist = true;
        payload.isUserAuthenticated = data.credentials.hash === crypto.pbkdf2Sync(request.body.password, data.credentials.salt, 1000, 64).toString('hex');
        response.json(payload);
      } else { // if user does not exist
        // respond with authentication failure
        response.json(payload);
      }
    });
  }
  // REGISTER
  register(request, response) {
    let payload = {};
    // check if user already exists first
    _database.collection(providerCollection).findOne({ 'handle': request.body.handle }).then((data) => {
      if (data) {
        // if user already exists
        // respond with registration failure
        payload.doesUserExist = true;
        response.json(payload);
      } else {
        // if user does not exist
        // register with information
        let provider = initializeProvider(request.body);
        _database.collection(providerCollection).insert(provider).then((data) => {
          response.json(payload);
        });
      }
    });
  }
  // SEARCH
  search(request, response) {
    let regex = new RegExp(request.params.input, 'i');
    let searchInput = [
      { 'handle': { $regex: regex} },
      { 'email': { $regex: regex} },
      { 'name': { $regex: regex} },
    ];
    let options = {
      'handle': true,
      'email': true,
      'name': true
    };
    _database.collection(providerCollection).find({ $or: searchInput }, options).toArray((error, data) => {
      response.json(data); 
    });
  }

  // ----- EMPLOYEES -----
  // GET EMPLOYEES
  getEmployees(request, response) {
    _database.collection(providerCollection).findOne({ _id: ObjectId(request.params.providerID) }, { employees: true }).then((data) => {
      _database.collection(employeeCollection).find({ _id: { $in: keysToArray(data.employees) } }).toArray((error, data) => {
        response.json(data);
      });
    });
  }
  // ADD EMPLOYEE
  addEmployee(request, response) {
    let employee = createEmployee(request.body);
    _database.collection(employeeCollection).insert(employee).then((data) => {
      let set = {};
      set[`employees.${data.ops[0]._id.toString()}`] = true;
      _database.collection(providerCollection).updateOne({ _id: ObjectId(request.body.providerID) }, { $set: set }).then((data) => {
        response.json('Success!');
      });
    });
  }
  // DELETE EMPLOYEE
  deleteEmployee(request, response) {
    _database.collection(employeeCollection).deleteOne({ _id: ObjectId(request.body.employeeID) }).then((data) => {
      let unset = {};
      unset[`employees.${request.body.employeeID}`] = "";
      _database.collection(providerCollection).updateOne({ _id: ObjectId(request.body.providerID) }, { $unset: unset }).then((data) => {
        response.json("Success!");
      });
    });
  }

  // GET EMPLOYEE SERVICES
  getServices(request, response) {
    _database.collection(employeeCollection).findOne({ _id: ObjectId(request.params.employeeID) }, { services: true}).then((data) => {
      response.json(data);
    });
  }
  // ADD EMPLOYEE SERVICE
  addService(request, response) {
    let service = createService(request.body);
    let set = {};
    set[`services.${service._id}`] = service;
    response.json(service);
    _database.collection(employeeCollection).updateOne({ _id: ObjectId(request.body.employeeID) }, { $set: set }).then((data) => {
      response.json('Success!');
    });
  }
  // EDIT EMPLOYEE SERVICE
  editService(request, response) {
    _database.collection(employeeCollection).findOne({ _id: ObjectId(request.params.employeeID) }).then((employee) => {
      let service = createService(request.body, true);
      employee.services[service.id] = service;
      _database.collection(employeeCollection).updateOne({ _id: ObjectId(request.params.employeeID) }, employee).then((data) => {
        response.json('Success!');
      });
    });
  }
  // DELETE EMPLOYEE SERVICE
  deleteService(request, response) {
    _database.collection(employeeCollection).findOne({ _id: ObjectId(request.params.employeeID) }).then((employee) => {
      let service = createService(request.body, true);
      delete employee.services[request.body.id];
      _database.collection(employeeCollection).updateOne({ _id: ObjectId(request.params.employeeID) }, employee).then((data) => {
        response.json('Success!');
      });
    });
  }
  // GET EMPLOYEE APPOINTMENTS
  getAppointments(request, response) {
    _database.collection(employeeCollection).findOne({ _id: ObjectId(request.params.employeeID) }, { appointments: true }).then((employee) => {
      _database.collection(appointmentsCollection).find({ _id: { $in: employee.appointments } }).toArray((appointments) => {
        response.json(appointments);
      });
    })
  }
  // ADD APPOINTMENT
  addAppointment(request, response) {
    let appointment = createAppointment(request.body);
    _database.collection(appointmentsCollection).insert(appointment).then((appointment) => {
      _database.collection(employeeCollection).updateOne({ _id: ObjectId(appointment.employeeID) }, { $push: { services: appointment._id } }).then((data) => {
        response.json('Success!');
      });
    });
  }
  // EDIT APPOINTMENT
  editAppointment(request, response) {
    let appointment = createAppointment(request.body);
    _database.collection(appointmentsCollection).updateOne({ _id: ObjectId(appointment._id) }, appointment).then((data) => {
      response.json('Success!');
    })
  }
  deleteAppointment(request, response) {
    _database.collection(appointmentsCollection).deleteOne({ _id: ObjectId(request.body.id) }).then((data) => {
      response.json('Success!');
    });
  }
  setDatabase(database) {
    _database = database;
  }
}

const provider = new Provider();
module.exports = provider;


// ----- HELPER METHODS -----

function initializeProvider(info) {
  let salt = crypto.randomBytes(16).toString('hex');
  let hash = crypto.pbkdf2Sync(info.password, salt, 1000, 64, 'sha512').toString('hex');
  let provider = {
    handle: info.handle,
    email: info.email,
    name: info.name,
    credentials: {
      hash: hash,
      salt: salt
    },
    employees: {},
  };
  return provider;
}
function createEmployee(info) {
  let employee = {
    providerID: info.providerID,
    username: info.username,
    name: info.name,
    email: info.email,
    appointments: {}
  };
  return employee;
}
function createService(info, editMode) {
  if (!editMode) {
    let id = ObjectId();
  } else {
    let id = info._id
  }
  let service = {
    _id: 1,
    type: info.type,
    cost: info.cost,
    duration: info.duration,
    employeeID: info.employeeID
  };
  return service;
}
function createAppointment(info) {
  let appointment = {
    date: {
      day: info.date.day,
      month: info.date.month,
      year: info.date.year,
    },
    timeslot: {
      begin: info.timeslot.begin,
      end: info.timeslot.end
    },
    serviceID: info.serviceID,
    providerID: info.providerID,
    employeeID: info.employeeID,
  };
  return appointment;
}
function keysToArray(object) {
  let array = [];
  for (let key in object) {
    array.push(ObjectId(key));
  }
  return array;
}