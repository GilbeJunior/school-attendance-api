const express = require('express');

const routes = new express.Router();

// User routes
routes.get('/user/:id/', CustomerController.getUserById);
routes.post('/user/new-user', CustomerController.createUser);
routes.post('/user/login', CustomerController.authenticate);
routes.post('/user/forgot-password', CustomerController.forgotPassword);
routes.post('/user/reset-password', CustomerController.resetPassword);
routes.delete('/user/:id/delete-user', CustomerController.deleteUser);

module.exports = routes;