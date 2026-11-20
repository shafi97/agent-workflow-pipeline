# Feature: business-hours SLA calculator

Support teams promise "answered within 8 business hours". Plain date math gets this wrong across nights, weekends and holidays. This module answers two questions: when is a request due, and how many business minutes have passed.

Times are wall-clock times in the business's own time zone. The caller converts before calling; the module does not guess time zones.

## Config
- `workStart` and `workEnd` (hours, default 9 and 17)
- `workDays` (0 = Sunday to 6 = Saturday, default Monday to Friday)
- `holidays` (list of `YYYY-MM-DD` dates, default none)

## Acceptance criteria
- AC1: `addBusinessHours(start, hours)` inside one working day returns start plus the hours.
- AC2: Time that does not fit in the day carries over to the next working day, starting at `workStart`.
- AC3: Weekends and non-working days are skipped.
- AC4: Holidays are skipped.
- AC5: A start time before opening counts from opening; after closing or on a non-working day counts from the next opening.
- AC6: Zero hours returns the first working moment at or after start.
- AC7: Negative, NaN or infinite hours throw a RangeError; invalid dates throw a TypeError.
- AC8: 400 business hours finishes (no endless loop) and lands on the right day.
- AC9: `businessMinutesBetween(a, b)` returns the working minutes elapsed, 0 if b is not after a, and agrees with `addBusinessHours` (adding N minutes then measuring gives back N).
- AC10: Invalid config (workEnd not after workStart, empty workDays, malformed holiday) throws a RangeError.

## Out of scope
Time zones, daylight saving, partial-day holidays.
