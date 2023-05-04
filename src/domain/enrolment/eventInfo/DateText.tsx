import React from 'react';

import getDateRangeStr from '../../../utils/getDateRangeStr';
import { dateOrNull } from '../../api/types';

export interface DateTextProps {
  endTime: dateOrNull;
  startTime: dateOrNull;
}

const DateText: React.FC<DateTextProps> = ({ endTime, startTime }) => {
  const getText = () =>
    getDateRangeStr({ end: endTime, start: startTime, language: 'fi' });
  return <>{getText()}</>;
};

export default DateText;
