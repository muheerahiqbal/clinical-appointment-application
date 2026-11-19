function isValidTime(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isAvailableAt(doctor, date, timeSlot) {
  if (!isValidTime(timeSlot) || !(date instanceof Date) || Number.isNaN(date.getTime())) {
    return false;
  }
  const day = date.getUTCDay();
  const slotStart = timeSlot.split(':').reduce((total, part) => total * 60 + Number(part), 0);
  const duration = doctor.slotDurationMinutes || 30;

  return doctor.availableSlots.some((availability) => {
    if (availability.dayOfWeek !== day || !isValidTime(availability.startTime)
      || !isValidTime(availability.endTime)) {
      return false;
    }
    const start = availability.startTime.split(':').reduce((total, part) => total * 60 + Number(part), 0);
    const end = availability.endTime.split(':').reduce((total, part) => total * 60 + Number(part), 0);
    return slotStart >= start && slotStart + duration <= end && (slotStart - start) % duration === 0;
  });
}

module.exports = { isAvailableAt, isValidTime };
