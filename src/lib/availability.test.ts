import { describe, expect, it } from 'vitest'
import { format } from 'date-fns'
import {
  generateTimeSlots,
  groupSlotsByPeriod,
  isDateSelectable,
  overlaps,
  type AvailabilityInput,
} from './availability'
import type { BusinessHours } from './types'

// Thursday, September 10, 2026 at 9:00 AM local time.
const NOW = new Date(2026, 8, 10, 9, 0)
const MONDAY = new Date(2026, 8, 14) // weekday 1
const SUNDAY = new Date(2026, 8, 13) // weekday 0
const FRIDAY = new Date(2026, 8, 11) // weekday 5

function hours(): BusinessHours[] {
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    id: `bh-${weekday}`,
    weekday,
    is_open: weekday !== 0,
    start_time: '08:00:00',
    end_time: '18:00:00',
  }))
}

function input(overrides: Partial<AvailabilityInput> = {}): AvailabilityInput {
  return {
    date: MONDAY,
    serviceDurationMinutes: 60,
    businessHours: hours(),
    settings: { slot_interval_minutes: 30, booking_notice_hours: 24 },
    blockedDates: [],
    bookedSlots: [],
    now: NOW,
    ...overrides,
  }
}

const labels = (slots: ReturnType<typeof generateTimeSlots>) => slots.map((slot) => slot.label)

describe('generateTimeSlots', () => {
  it('returns nothing on a closed weekday', () => {
    expect(generateTimeSlots(input({ date: SUNDAY }))).toEqual([])
  })

  it('returns nothing when the weekday has no business_hours row', () => {
    const withoutMonday = hours().filter((row) => row.weekday !== 1)
    expect(generateTimeSlots(input({ businessHours: withoutMonday }))).toEqual([])
  })

  it('returns nothing on a blocked date (string or row form)', () => {
    expect(generateTimeSlots(input({ blockedDates: ['2026-09-14'] }))).toEqual([])
    expect(
      generateTimeSlots(
        input({
          blockedDates: [{ id: 'b1', blocked_date: '2026-09-14', reason: 'Holiday', created_at: '' }],
        }),
      ),
    ).toEqual([])
  })

  it('keeps every slot fully inside working hours', () => {
    const slots = generateTimeSlots(input({ serviceDurationMinutes: 120 }))
    expect(slots[0].label).toBe('8:00 AM')
    expect(format(slots[slots.length - 1].start, 'HH:mm')).toBe('16:00')
    expect(format(slots[slots.length - 1].end, 'HH:mm')).toBe('18:00')
    // 8:00 → 16:00 every 30 minutes
    expect(slots).toHaveLength(17)
  })

  it('uses slot_interval_minutes as the cadence and the service duration as the length', () => {
    const slots = generateTimeSlots(
      input({ serviceDurationMinutes: 90, settings: { slot_interval_minutes: 45, booking_notice_hours: 24 } }),
    )
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i].start.getTime() - slots[i - 1].start.getTime()).toBe(45 * 60_000)
    }
    for (const slot of slots) {
      expect(slot.end.getTime() - slot.start.getTime()).toBe(90 * 60_000)
    }
  })

  it('always returns real, valid Date objects', () => {
    for (const slot of generateTimeSlots(input())) {
      expect(slot.start).toBeInstanceOf(Date)
      expect(slot.end).toBeInstanceOf(Date)
      expect(Number.isNaN(slot.start.getTime())).toBe(false)
      expect(Number.isNaN(slot.end.getTime())).toBe(false)
    }
  })

  it('removes slots that start inside the booking notice window', () => {
    // now = Thu 9:00, notice 24h → earliest start is Fri 9:00
    const slots = generateTimeSlots(input({ date: FRIDAY }))
    expect(slots[0].label).toBe('9:00 AM')
    expect(labels(slots)).not.toContain('8:00 AM')
    expect(labels(slots)).not.toContain('8:30 AM')
  })

  it('returns nothing for today when the notice window covers the rest of the day', () => {
    expect(generateTimeSlots(input({ date: NOW }))).toEqual([])
  })

  it('never offers same-day slots, even when the notice window is 0 hours', () => {
    expect(
      generateTimeSlots(input({ date: NOW, settings: { slot_interval_minutes: 30, booking_notice_hours: 0 } })),
    ).toEqual([])
  })

  it('offers the next day from opening time when the notice window is 0 hours', () => {
    const slots = generateTimeSlots(
      input({ date: FRIDAY, settings: { slot_interval_minutes: 30, booking_notice_hours: 0 } }),
    )
    expect(slots[0].label).toBe('8:00 AM')
  })

  it('applies the overlap rule and keeps adjacent slots', () => {
    const slots = generateTimeSlots(input({ bookedSlots: [{ start_time: '10:00:00', end_time: '11:00:00' }] }))
    const result = labels(slots)
    expect(result).toContain('9:00 AM') // ends exactly at 10:00 → no overlap
    expect(result).not.toContain('9:30 AM')
    expect(result).not.toContain('10:00 AM')
    expect(result).not.toContain('10:30 AM')
    expect(result).toContain('11:00 AM') // starts exactly at 11:00 → no overlap
  })

  it('only considers the windows it is given (cancelled ones are filtered by the caller)', () => {
    const active = [{ start_time: '13:00:00', end_time: '15:00:00' }]
    const result = labels(generateTimeSlots(input({ bookedSlots: active })))
    expect(result).not.toContain('1:00 PM')
    expect(result).not.toContain('2:30 PM')
    expect(result).toContain('3:00 PM')
    expect(result).toContain('12:00 PM')
  })

  it('ignores malformed booked times instead of crashing', () => {
    const clean = generateTimeSlots(input())
    const withGarbage = generateTimeSlots(
      input({
        bookedSlots: [
          { start_time: 'garbage', end_time: '11:00:00' },
          { start_time: '12:00:00', end_time: '' },
          { start_time: '14:00:00', end_time: '13:00:00' },
        ],
      }),
    )
    expect(labels(withGarbage)).toEqual(labels(clean))
  })

  it('returns nothing for an invalid date', () => {
    expect(generateTimeSlots(input({ date: new Date('not a date') }))).toEqual([])
  })

  it('returns nothing when the service is longer than the working day', () => {
    expect(generateTimeSlots(input({ serviceDurationMinutes: 11 * 60 }))).toEqual([])
  })

  it('formats labels like "9:00 AM" and "1:30 PM"', () => {
    const result = labels(generateTimeSlots(input()))
    expect(result).toContain('9:00 AM')
    expect(result).toContain('1:30 PM')
  })
})

describe('overlaps', () => {
  const at = (h: number, m = 0) => new Date(2026, 8, 14, h, m)
  it('matches new_start < existing_end AND new_end > existing_start', () => {
    expect(overlaps(at(9, 30), at(10, 30), at(10), at(11))).toBe(true)
    expect(overlaps(at(9), at(10), at(10), at(11))).toBe(false)
    expect(overlaps(at(11), at(12), at(10), at(11))).toBe(false)
    expect(overlaps(at(9), at(12), at(10), at(11))).toBe(true)
  })
})

describe('isDateSelectable', () => {
  const base = {
    businessHours: hours(),
    blockedDates: [] as string[],
    settings: { slot_interval_minutes: 30, booking_notice_hours: 24 },
    serviceDurationMinutes: 60,
    now: NOW,
  }

  it('rejects past days', () => {
    expect(isDateSelectable(new Date(2026, 8, 9), base)).toBe(false)
  })

  it('rejects closed weekdays', () => {
    expect(isDateSelectable(SUNDAY, base)).toBe(false)
  })

  it('rejects blocked dates', () => {
    expect(isDateSelectable(MONDAY, { ...base, blockedDates: ['2026-09-14'] })).toBe(false)
  })

  it('rejects today even when the notice window would allow it', () => {
    expect(
      isDateSelectable(NOW, { ...base, settings: { slot_interval_minutes: 30, booking_notice_hours: 0 } }),
    ).toBe(false)
  })

  it('rejects a day whose latest possible start falls before the notice window', () => {
    // Today: latest start 17:00 Thu < earliest Fri 09:00
    expect(isDateSelectable(NOW, base)).toBe(false)
    // Friday with 40h notice: earliest is Sat 01:00
    expect(
      isDateSelectable(FRIDAY, { ...base, settings: { slot_interval_minutes: 30, booking_notice_hours: 40 } }),
    ).toBe(false)
  })

  it('accepts a normal open future day', () => {
    expect(isDateSelectable(MONDAY, base)).toBe(true)
  })

  it('rejects a day where the slot cadence leaves no valid start after the notice cutoff', () => {
    // 08:00–18:00, 90-min service, hourly slots, earliest start Mon 16:15.
    // Latest possible start (16:30) is after the cutoff, but the grid only offers 16:00 and 17:00.
    const now = new Date(2026, 8, 14, 16, 15)
    expect(
      isDateSelectable(MONDAY, {
        ...base,
        now,
        serviceDurationMinutes: 90,
        settings: { slot_interval_minutes: 60, booking_notice_hours: 0 },
      }),
    ).toBe(false)
  })
})

describe('groupSlotsByPeriod', () => {
  it('groups into morning, afternoon and evening in order', () => {
    const slots = generateTimeSlots(
      input({
        businessHours: hours().map((row) => ({ ...row, end_time: '20:00:00' })),
        settings: { slot_interval_minutes: 60, booking_notice_hours: 24 },
      }),
    )
    const groups = groupSlotsByPeriod(slots)
    expect(groups.map((group) => group.label)).toEqual(['Morning', 'Afternoon', 'Evening'])
    expect(groups[0].slots[0].label).toBe('8:00 AM')
    expect(groups[2].slots[0].label).toBe('5:00 PM')
  })
})
