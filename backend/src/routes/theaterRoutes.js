const express = require('express');
const { getTheaters, getTheaterById, getCities } = require('../controllers/theaterController');

const router = express.Router();

router.get('/cities', getCities);
router.get('/', getTheaters);
router.get('/:id', getTheaterById);

module.exports = router;
