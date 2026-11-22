const express = require('express');
const {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
} = require('../controllers/holidayController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getHolidays).post(createHoliday);
router.route('/:id').put(updateHoliday).delete(deleteHoliday);

module.exports = router;
