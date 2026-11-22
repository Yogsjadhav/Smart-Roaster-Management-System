const express = require('express');
const {
  getLeaves,
  getLeave,
  createLeave,
  updateLeave,
  approveLeave,
  rejectLeave,
  deleteLeave
} = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getLeaves).post(createLeave);
router.route('/:id').get(getLeave).put(updateLeave).delete(deleteLeave);
router.put('/:id/approve', approveLeave);
router.put('/:id/reject', rejectLeave);

module.exports = router;
