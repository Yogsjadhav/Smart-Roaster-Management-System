const express = require('express');
const {
  getProcesses,
  getProcess,
  createProcess,
  updateProcess,
  deleteProcess
} = require('../controllers/processController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getProcesses).post(createProcess);
router.route('/:id').get(getProcess).put(updateProcess).delete(deleteProcess);

module.exports = router;
