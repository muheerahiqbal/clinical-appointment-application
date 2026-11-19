const express = require('express');
const doctorController = require('../controllers/doctorController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(doctorController.listVerifiedDoctors));
router.get('/me/profile', verifyToken, authorizeRoles('doctor'), asyncHandler(doctorController.getMyProfile));
router.patch('/me/profile', verifyToken, authorizeRoles('doctor'), upload.document.single('certificate'), asyncHandler(doctorController.updateMyProfile));
router.get('/:id', asyncHandler(doctorController.getDoctor));

module.exports = router;
