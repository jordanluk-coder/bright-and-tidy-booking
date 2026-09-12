import { describe, expect, it } from 'vitest'
import {
  combineDateAndTime,
  formatDuration,
  formatPrice,
  formatTime,
  formatTimeRange,
  minutesToTimeString,
  parseDateString,
  parseTimeToMinutes,
  toDateString,
  toInputTime,
  toTimeString,
} from './format'

describe('parseTimeToMinutes', () => {
  it('parses HH:MM and HH:MM:SS', () => {
    expect(parseTimeToMinutes('09:00')).toBe(540)
    expect(parseTimeToMinutes('09:00:00')).toBe(540)
    expect(parseTimeToMinutes('17:45:00')).toBe(17 * 60 + 45)
  })

  it('returns null for invalid input', () => {
    expect(parseTimeToMinutes('')).toBeNull()
    expect(parseTimeToMinutes('abc')).toBeNull()
    expect(parseTimeToMinutes('25:00')).toBeNull()
    expect(parseTimeToMinutes('10:75')).toBeNull()
    expect(parseTimeToMinutes(null)).toBeNull()
    expect(parseTimeToMinutes(undefined)).toBeNull()
  })
})

describe('minutesToTimeString / toInputTime', () => {
  it('produces Supabase-compatible TIME strings', () => {
    expect(minutesToTimeString(540)).toBe('09:00:00')
    expect(minutesToTimeString(13 * 60 + 5)).toBe('13:05:00')
  })

  it('produces <input type="time"> values', () => {
    expect(toInputTime('08:30:00')).toBe('08:30')
    expect(toInputTime('garbage')).toBe('')
  })
})

describe('combineDateAndTime', () => {
  it('builds a real local Date from a day and a TIME string', () => {
    const result = combineDateAndTime(new Date(2026, 8, 14), '13:30:00')
    expect(result).toBeInstanceOf(Date)
    expect(result!.getFullYear()).toBe(2026)
    expect(result!.getMonth()).toBe(8)
    expect(result!.getDate()).toBe(14)
    expect(result!.getHours()).toBe(13)
    expect(result!.getMinutes()).toBe(30)
  })

  it('ignores the time portion of the day argument', () => {
    const result = combineDateAndTime(new Date(2026, 8, 14, 22, 15), '08:00')
    expect(result!.getHours()).toBe(8)
    expect(result!.getMinutes()).toBe(0)
  })

  it('returns null for invalid inputs', () => {
    expect(combineDateAndTime(new Date('nope'), '09:00')).toBeNull()
    expect(combineDateAndTime(new Date(2026, 8, 14), 'yyyy-MM-ddT10:30:00')).toBeNull()
  })
})

describe('date and time serialization', () => {
  it('round-trips DATE and TIME values', () => {
    const moment = new Date(2026, 8, 14, 13, 30)
    expect(toDateString(moment)).toBe('2026-09-14')
    expect(toTimeString(moment)).toBe('13:30:00')
    const parsed = parseDateString('2026-09-14')
    expect(parsed && toDateString(parsed)).toBe('2026-09-14')
  })

  it('rejects impossible dates', () => {
    expect(parseDateString('2026-02-30')).toBeNull()
    expect(parseDateString('not-a-date')).toBeNull()
  })
})

describe('display formatting', () => {
  it('formats times', () => {
    expect(formatTime('13:30:00')).toBe('1:30 PM')
    expect(formatTime('09:00:00')).toBe('9:00 AM')
    expect(formatTime('bad')).toBe('')
    expect(formatTimeRange('09:00:00', '11:00:00')).toBe('9:00 AM – 11:00 AM')
  })

  it('formats durations', () => {
    expect(formatDuration(90)).toBe('1 hr 30 min')
    expect(formatDuration(60)).toBe('1 hr')
    expect(formatDuration(45)).toBe('45 min')
    expect(formatDuration(0)).toBe('—')
  })

  it('formats prices', () => {
    expect(formatPrice(149)).toBe('$149')
    expect(formatPrice(149.5)).toBe('$149.50')
    expect(formatPrice('289.00')).toBe('$289')
    expect(formatPrice(null)).toBe('—')
  })
})
