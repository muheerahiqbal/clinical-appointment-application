const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(verifyToken);
router.post('/', authorizeRoles('patient'), asyncHandler(appointmentController.bookAppointment));
router.get('/mine', authorizeRoles('patient', 'doctor'), asyncHandler(appointmentController.listMyAppointments));
router.patch('/:id/cancel', authorizeRoles('patient'), asyncHandler(appointmentController.cancelAppointment));
router.patch('/:id/respond', authorizeRoles('doctor'), asyncHandler(appointmentController.respondToAppointment));

module.exports = router;
