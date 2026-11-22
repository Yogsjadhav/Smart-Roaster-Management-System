const express = require('express');
const {
  getPods,
  getPod,
  createPod,
  updatePod,
  deletePod
} = require('../controllers/podController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getPods).post(createPod);
router.route('/:id').get(getPod).put(updatePod).delete(deletePod);

module.exports = router;
