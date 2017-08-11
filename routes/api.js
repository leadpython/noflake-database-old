var express = require('express');
var router = express.Router();
var provider = require('./provider.methods.js').router;

// ---------- PROVIDER ROUTES ----------

// AUTHENTICATION
// Login
router.put('/providers/login', (request, response) => {
  provider.login(request, response);
});
// Register
router.post('/providers/register', (request, response) => {

});

// SEARCH
// Search Provider
router.get('/providers/search/:input', (request, response) => {

});

// PROVIDER SERVICES
// Get Services
router.get('/providers/:id/services', (request, response) => {

});
// Add Service
router.post('/providers/:id/services', (request, response) => {

});
// Edit Service
router.put('/providers/:id/services/:service', (request, response) => {

});
// Delete Service
router.delete('providers/:id/services/:service', (request, response) => {

});

// PROVIDER APPOINTMENTS
// Get Appointments
router.get('/providers/:id/appointments', (request, response) => {

});
// Add Appointment
router.post('/providers/:id/appointments', (request, response) => {

});
// Edit Appointment
router.put('/providers/:id/appointments/:appointment', (request, response) => {

});
// Delete Appointment
router.delete('/providers/:id/appointments:appointment', (request, response) => {

});

module.exports = router;