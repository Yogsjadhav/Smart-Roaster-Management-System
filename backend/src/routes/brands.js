const express = require('express');
const {
  getBrands,
  getBrand,
  createBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getBrands).post(createBrand);
router.route('/:id').get(getBrand).put(updateBrand).delete(deleteBrand);

module.exports = router;
