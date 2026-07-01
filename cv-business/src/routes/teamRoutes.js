const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/teamController');
const { auth, adminOnly } = require('../middleware/auth');
const { upload } = require('../utils/cloudinaryUpload');

router.get('/', TeamController.getAllTeamMembers);
router.get('/:id', TeamController.getTeamMemberById);
router.post('/', auth, adminOnly, upload.single('photo'), TeamController.createTeamMember);
router.put('/:id', auth, adminOnly, upload.single('photo'), TeamController.updateTeamMember);
router.delete('/:id', auth, adminOnly, TeamController.deleteTeamMember);

module.exports = router;
