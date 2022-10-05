import {
  addDays,
  isBefore,
  isSameDay,
  isSameMonth,
  isSameYear,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import { Language } from '../types';
import formatDate from './formatDate';
import getTimeFormat from './getTimeFormat';

/**
 * Format and localise date range to show on UI
 */
const getDateRangeStr = ({
  end,
  language,
  start,
}: {
  end?: Date | null;
  language: Language;
  start: Date;
}): string => {
  const timeZone = 'Europe/Helsinki';
  const startDate = utcToZonedTime(start, timeZone);
  const nextDay = utcToZonedTime(addDays(startDate, 1), timeZone);
  nextDay.setHours(5, 0, 0, 0);

  const dateFormat = 'd.M.yyyy';
  const timeFormat = getTimeFormat(language);

  if (!end) {
    const dateStr = formatDate(startDate, dateFormat, language);
    const timeStr = formatDate(startDate, timeFormat, language);

    return `${[dateStr, timeStr].join(', ')} –`;
  } else {
    const endDate = utcToZonedTime(end, timeZone);

    if (isSameDay(startDate, endDate) || isBefore(endDate, nextDay)) {
      const dateStr = formatDate(startDate, dateFormat, language);
      const startTimeStr = formatDate(startDate, timeFormat, language);
      const endTimeStr = formatDate(endDate, timeFormat, language);
      const timeStr = `${startTimeStr} – ${endTimeStr}`;

      return [dateStr, timeStr].join(', ');
    } else if (isSameMonth(startDate, endDate)) {
      const startDateStr = formatDate(startDate, 'd');
      const endDateStr = formatDate(endDate, 'd.M.yyyy');

      return `${startDateStr} – ${endDateStr}`;
    } else if (isSameYear(startDate, endDate)) {
      const startDateStr = formatDate(startDate, 'd.M');
      const endDateStr = formatDate(endDate, 'd.M.yyyy');

      return `${startDateStr} – ${endDateStr}`;
    } else {
      const startDateStr = formatDate(startDate, 'd.M.yyyy');
      const endDateStr = formatDate(endDate, 'd.M.yyyy');

      return `${startDateStr} – ${endDateStr}`;
    }
  }
};

export default getDateRangeStr;
