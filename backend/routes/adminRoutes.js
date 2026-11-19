const express = require('express');
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(verifyToken, authorizeRoles('admin'));
router.get('/statistics', asyncHandler(adminController.getStatistics));
router.get('/doctors', asyncHandler(adminController.listDoctors));
router.patch('/doctors/:id/verification', asyncHandler(adminController.verifyDoctor));
router.delete('/doctors/:id', asyncHandler(adminController.deleteDoctor));
router.get('/patients', asyncHandler(adminController.listPatients));
router.delete('/patients/:id', asyncHandler(adminController.deletePatient));
router.get('/appointments', asyncHandler(adminController.listAppointments));

module.exports = router;
