const express = require('express');
const router = express.Router();
const { createBox, getAllBoxes, getBoxById, updateBox, deleteBox } = require('../controllers/boxesController');

router.get('/', getAllBoxes);
router.get('/:id', getBoxById);
router.post('/', createBox);
router.put('/:id', updateBox);
router.delete('/:id', deleteBox);

module.exports = router;
