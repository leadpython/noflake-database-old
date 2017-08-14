var express = require('express');
var router = express.Router();
var provider = require('./provider.methods.js');

// ---------- PROVIDER ROUTES ----------

// AUTHENTICATION
// Login
router.put('/providers/login', (request, response) => {
  provider.login(request, response);
});
// Register
router.post('/providers/register', (request, response) => {
  provider.register(request, response);
});

// Search Provider
router.get('/providers/search/:input', (request, response) => {
  provider.search(request, response);
});

// PROVIDER EMPLOYEES
router.get('/providers/:providerID/employees', (request, response) => {
  provider.getEmployees(request, response);
});
// ADD EMPLOYEE
router.post('/providers/employees', (request, response) => {
  provider.addEmployee(request, response);
});
// DELETE EMPLOYEE
router.delete('/providers/employees', (request, response) => {
  provider.deleteEmployee(request, response);
});

// EMPLOYEE SERVICES
// Get Services
router.get('/providers/:providerID/employees/:employeeID/services', (request, response) => {
  provider.getServices(request, response);
});
// Add Service
router.post('/providers/:providerID/employees/:employeeID/services', (request, response) => {
  provider.addService(request, response);
});
// Edit Service
router.put('/providers/:providerID/employees/:employeeID/services', (request, response) => {
  provider.editService(request, response);
});
// Delete Service
router.delete('providers/:id/services/:service', (request, response) => {
  provider.deleteService(request, response);
});

// PROVIDER APPOINTMENTS
// Get Appointments
router.get('/providers/:providerID/employees/:employeeID/appointments', (request, response) => {
  provider.getAppointments(request, response);
});
// Add Appointment
router.post('/providers/:providerID/employees/:employeeID/appointments', (request, response) => {
  provider.addAppointment(request, response);
});
// Edit Appointment
router.put('/providers/:providerID/employees/:employeeID/appointments', (request, response) => {
  provider.editAppointment(request, response);
});
// Delete Appointment
router.delete('/providers/:providerID/employees/:employeeID/appointments', (request, response) => {
  provider.deleteAppointment(request, response);
});

module.exports = router;