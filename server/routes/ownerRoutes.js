const express = require('express');
const OwnerController = require('../controllers/ownerController');

const router = express.Router();

router.get('/', OwnerController.getAllOwners);
router.post('/', OwnerController.createOwner);
router.put('/:ownerId', OwnerController.updateOwner);
router.delete('/:ownerId', OwnerController.deleteOwner);

module.exports = router;
