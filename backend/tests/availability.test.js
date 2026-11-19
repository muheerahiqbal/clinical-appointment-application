const test = require('node:test');
const assert = require('node:assert/strict');
const { isAvailableAt } = require('../services/availabilityService');
const { parseAppointmentDate } = require('../controllers/appointmentController');

const doctor = {
  slotDurationMinutes: 30,
  availableSlots: [{ dayOfWeek: 1, startTime: '09:00', endTime: '12:00' }]
};

test('accepts only aligned appointments fully inside the weekly availability window', () => {
  const monday = new Date('2027-01-04T00:00:00.000Z');
  assert.equal(isAvailableAt(doctor, monday, '09:00'), true);
  assert.equal(isAvailableAt(doctor, monday, '11:30'), true);
  assert.equal(isAvailableAt(doctor, monday, '11:45'), false);
  assert.equal(isAvailableAt(doctor, monday, '12:00'), false);
});

test('rejects times outside the configured day and malformed dates or times', () => {
  assert.equal(isAvailableAt(doctor, new Date('2027-01-05T00:00:00.000Z'), '09:00'), false);
  assert.equal(isAvailableAt(doctor, new Date(Number.NaN), '09:00'), false);
  assert.equal(isAvailableAt(doctor, new Date('2027-01-04T00:00:00.000Z'), '9:00'), false);
});

test('parses valid calendar dates and rejects invalid date values', () => {
  assert.equal(parseAppointmentDate('2027-01-04').toISOString(), '2027-01-04T00:00:00.000Z');
  assert.equal(parseAppointmentDate('2027-02-29'), null);
  assert.equal(parseAppointmentDate('2027-13-01'), null);
});
