var crypto = require('crypto');
var ObjectId = require('mongodb').ObjectId;
var providerCollection = 'providers';
var employeeCollection = 'employees';
var appointmentCollection = 'appointments';
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
    let provider = initializeProvider(request.body);
    // check if user already exists first
    _database.collection(providerCollection).findOne({ '_id': ObjectId(request.body.providerID) }).then((data) => {
      if (data) {
        // if user already exists
        // respond with registration failure
        payload.doesUserExist = true;
        response.json(payload);
      } else {
        // if user does not exist
        // register with information
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
      response.json(data.services);
    });
  }
  // ADD EMPLOYEE SERVICE
  addService(request, response) {
    let service = createService(request.body);
    let set = {};
    set[`services.${service._id}`] = service;
    _database.collection(employeeCollection).updateOne({ _id: ObjectId(request.body.employeeID) }, { $set: set }).then((data) => {
      response.json('Success!');
    });
  }
  // EDIT EMPLOYEE SERVICE
  editService(request, response) {
    _database.collection(employeeCollection).findOne({ _id: ObjectId(request.body.employeeID) }).then((employee) => {
      let service = createService(request.body, true);
      response.json(service);
      let set = {};
      set[`services.${service._id}`] = service;
      _database.collection(employeeCollection).updateOne({ _id: ObjectId(request.body.employeeID) }, { $set: set }).then((data) => {
        response.json('Success!');
      });
    });
  }
  // DELETE EMPLOYEE SERVICE
  deleteService(request, response) {
    _database.collection(employeeCollection).findOne({ _id: ObjectId(request.body.employeeID) }).then((employee) => {
      delete employee.services[request.body._id];
      _database.collection(employeeCollection).updateOne({ _id: ObjectId(request.body.employeeID) }, { $set: { services: employee.services } }).then((data) => {
        response.json('Success!');
      });
    });
  }
  // GET EMPLOYEE ALL APPOINTMENTS
  getEmployeeAllAppointments(request, response) {
    _database.collection(employeeCollection).findOne({ _id: ObjectId(request.params.employeeID) }, { appointments: true }).then((employee) => {
      _database.collection(appointmentCollection).find({ _id: { $in: keysToArray(employee.appointments) } }).toArray((error, data) => {
        response.json(data);
      });
    });
  }
  // GET EMPLOYEE APPOINTMENTS ON DAY
  getEmployeeAppointmentsOnDay(request, response) {
    _database.collection(employeeCollection).findOne({ _id: ObjectId(request.params.employeeID) }, { appointments: true }).then((employee) => {
      _database.collection(appointmentCollection).find({ _id: { $in: keysToArray(employee.appointments) } }).toArray((error, data) => {
        var appointmentsOnDay = data.map(function(appointment) {
          if (appointment.day === request.params.day && appointment.month === request.params.month && appointment.year === request.params.year) {
            return appointment;
          }
        });
        response.json(appointmentsOnDay);
      });
    });
  }
  // ADD APPOINTMENT
  addAppointment(request, response) {
    let appointment = createAppointment(request.body);
    _database.collection(appointmentCollection).insert(appointment).then((data) => {
      let set = {};
      set[`appointments.${data.ops[0]._id.toString()}`] = true;
      _database.collection(employeeCollection).updateOne({ _id: ObjectId(appointment.employeeID) }, { $set: set }).then((data) => {
        response.json('Success!');
      });
    });
  }
  // DELETE APPOINTMENT
  deleteAppointment(request, response) {
    _database.collection(employeeCollection).findOne({ _id: ObjectId(request.body.employeeID) }).then((employee) => {
      delete employee.appointments[request.body._id];
      _database.collection(employeeCollection).updateOne({ _id: ObjectId(request.body.employeeID) }, { $set: { appointments: employee.appointments } }).then((data) => {
        _database.collection(appointmentCollection).deleteOne({ _id: ObjectId(request.body._id) }).then((data) => {
          response.json('Success!');
        });
      });
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
  let provider = {
    _id: ObjectId(info.providerID),
    handle: info.handle,
    email: info.email,
    name: '',
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
  let id;
  if (!editMode) {
    id = crypto.randomBytes(16).toString('hex');
  } else {
    id = info._id
  }
  let service = {
    _id: id,
    type: info.type,
    cost: info.cost,
    duration: info.duration
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