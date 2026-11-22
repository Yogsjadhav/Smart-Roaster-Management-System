const express = require('express');
const {
  generateRoster,
  getRosters,
  getRoster,
  getRosterEntries,
  getRosterConflicts,
  updateRosterEntry,
  publishRoster,
  revalidateRoster,
  deleteRoster
} = require('../controllers/rosterController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/generate', generateRoster);
router.route('/').get(getRosters);
router.route('/:id').get(getRoster).delete(deleteRoster);
router.get('/:id/entries', getRosterEntries);
router.get('/:id/conflicts', getRosterConflicts);
router.put('/entries/:id', updateRosterEntry);
router.put('/:id/publish', publishRoster);
router.post('/:id/revalidate', revalidateRoster);

module.exports = router;
