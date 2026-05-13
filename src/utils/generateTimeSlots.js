function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function toTimeString(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`
}

export function generateTimeSlots(start = '09:00', end = '18:00', interval = 60) {
  const slots = []
  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)

  for (let current = startMinutes; current < endMinutes; current += interval) {
    slots.push(toTimeString(current))
  }

  return slots
}