const express = require('express');
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getAssignments).post(createAssignment);
router.route('/:id').put(updateAssignment).delete(deleteAssignment);

module.exports = router;
