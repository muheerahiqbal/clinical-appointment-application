const express = require('express');
const patientController = require('../controllers/patientController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(verifyToken, authorizeRoles('patient'));
router.patch('/me/profile', asyncHandler(patientController.updateProfile));
router.post('/me/avatar', upload.single('avatar'), asyncHandler(patientController.updateAvatar));

module.exports = router;
