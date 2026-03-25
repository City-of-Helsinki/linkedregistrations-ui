import {
  addDays,
  isBefore,
  isSameDay,
  isSameMonth,
  isSameYear,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import { HELSINKI_TIME_ZONE } from '../constants';
import { dateOrNull } from '../domain/api/types';
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
  end: dateOrNull;
  language: Language;
  start: dateOrNull;
}): string => {
  const dateFormat = 'd.M.yyyy';
  const timeFormat = getTimeFormat(language);

  if (!end && !start) return '';

  if (end && !start) {
    const endDate = utcToZonedTime(end, HELSINKI_TIME_ZONE);
    const dateStr = formatDate(endDate, dateFormat, language);
    const timeStr = formatDate(endDate, timeFormat, language);

    return `– ${[dateStr, timeStr].join(', ')}`;
  }

  const startDate = utcToZonedTime(start as Date, HELSINKI_TIME_ZONE);
  const nextDay = utcToZonedTime(addDays(startDate, 1), HELSINKI_TIME_ZONE);
  nextDay.setHours(5, 0, 0, 0);

  if (!end) {
    const dateStr = formatDate(startDate, dateFormat, language);
    const timeStr = formatDate(startDate, timeFormat, language);

    return `${[dateStr, timeStr].join(', ')} –`;
  } else {
    const endDate = utcToZonedTime(end, HELSINKI_TIME_ZONE);

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
