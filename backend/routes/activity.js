const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

router.get('/', activityController.getActivity);

module.exports = router;
