const express = require('express');
const CustomerController = require('../controllers/customerController');

const router = express.Router();

router.get('/', CustomerController.getAllCustomers);
router.post('/register', CustomerController.registerCustomer);
router.put('/:id', CustomerController.updateCustomer);
router.delete('/:id', CustomerController.deleteCustomer);

module.exports = router;
