import { describe, expect, it } from 'vitest'
import { addBusinessHours, businessMinutesBetween } from './sla'

// 2026-11-16 is a Monday.
const at = (s: string) => new Date(`${s}:00Z`)
const iso = (d: Date) => d.toISOString().slice(0, 16)

describe('addBusinessHours', () => {
  it('AC1: stays in the same day when it fits', () => {
    expect(iso(addBusinessHours(at('2026-11-16T10:00'), 3))).toBe('2026-11-16T13:00')
  })
  it('AC2: carries over to the next working day from opening', () => {
    expect(iso(addBusinessHours(at('2026-11-16T15:00'), 4))).toBe('2026-11-17T11:00')
  })
  it('AC3: skips weekends', () => {
    expect(iso(addBusinessHours(at('2026-11-20T16:00'), 2))).toBe('2026-11-23T10:00')
  })
  it('AC4: skips holidays', () => {
    const cfg = { holidays: ['2026-11-17'] }
    expect(iso(addBusinessHours(at('2026-11-16T16:00'), 2, cfg))).toBe('2026-11-18T10:00')
  })
  it('AC5: before opening counts from opening; after closing or weekend from next opening', () => {
    expect(iso(addBusinessHours(at('2026-11-16T06:00'), 1))).toBe('2026-11-16T10:00')
    expect(iso(addBusinessHours(at('2026-11-16T18:30'), 1))).toBe('2026-11-17T10:00')
    expect(iso(addBusinessHours(at('2026-11-21T12:00'), 1))).toBe('2026-11-23T10:00')
  })
  it('AC6: zero hours returns the first working moment', () => {
    expect(iso(addBusinessHours(at('2026-11-21T12:00'), 0))).toBe('2026-11-23T09:00')
    expect(iso(addBusinessHours(at('2026-11-16T11:00'), 0))).toBe('2026-11-16T11:00')
  })
  it('AC7: rejects bad hours and bad dates', () => {
    for (const h of [-1, NaN, Infinity]) expect(() => addBusinessHours(at('2026-11-16T10:00'), h)).toThrow(RangeError)
    expect(() => addBusinessHours(new Date('nope'), 1)).toThrow(TypeError)
    expect(() => addBusinessHours('2026-11-16' as unknown as Date, 1)).toThrow(TypeError)
  })
  it('AC8: 400 business hours finishes and lands on the right day', () => {
    // 50 working days of 8 hours from Monday 2026-11-16 09:00 is 10 full weeks, ending Friday 2027-01-22 at closing
    expect(iso(addBusinessHours(at('2026-11-16T09:00'), 400))).toBe('2027-01-22T17:00')
  })
  it('AC10: rejects bad config', () => {
    const d = at('2026-11-16T10:00')
    expect(() => addBusinessHours(d, 1, { workStart: 17, workEnd: 9 })).toThrow(RangeError)
    expect(() => addBusinessHours(d, 1, { workDays: [] })).toThrow(RangeError)
    expect(() => addBusinessHours(d, 1, { workDays: [7] })).toThrow(RangeError)
    expect(() => addBusinessHours(d, 1, { holidays: ['Nov 17'] })).toThrow(RangeError)
  })
  it('supports custom hours and days', () => {
    const cfg = { workStart: 8, workEnd: 12, workDays: [1, 2, 3] }
    expect(iso(addBusinessHours(at('2026-11-18T10:00'), 3, cfg))).toBe('2026-11-23T09:00')
  })
})

describe('businessMinutesBetween', () => {
  it('AC9: counts working minutes across nights and weekends', () => {
    expect(businessMinutesBetween(at('2026-11-20T16:00'), at('2026-11-23T10:00'))).toBe(120)
  })
  it('AC9: returns 0 when the end is not after the start', () => {
    expect(businessMinutesBetween(at('2026-11-16T10:00'), at('2026-11-16T10:00'))).toBe(0)
    expect(businessMinutesBetween(at('2026-11-16T11:00'), at('2026-11-16T10:00'))).toBe(0)
  })
  it('AC9: ignores time outside working hours', () => {
    expect(businessMinutesBetween(at('2026-11-21T09:00'), at('2026-11-22T20:00'))).toBe(0)
  })
  it('AC9: agrees with addBusinessHours', () => {
    const start = at('2026-11-18T14:20')
    for (const minutes of [1, 45, 300, 1000, 4000]) {
      const end = addBusinessHours(start, minutes / 60, { holidays: ['2026-11-25'] })
      expect(businessMinutesBetween(start, end, { holidays: ['2026-11-25'] })).toBeCloseTo(minutes, 3)
    }
  })
})
