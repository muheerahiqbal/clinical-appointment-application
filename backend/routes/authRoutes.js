const express = require('express');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post('/register', upload.document.single('certificate'), asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.currentUser);

module.exports = router;
