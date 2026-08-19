// Validates that the input string is a valid date formatted as "d.M.yyyy"
const isValidDate = (dateString: string): boolean => {
  const dateRegex = /^\d{1,2}\.\d{1,2}\.\d{4}$/;

  if (!dateRegex.test(dateString)) return false;

  // Parse the date parts to integers
  const parts = dateString.split('.');
  const day = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10);
  const year = Number.parseInt(parts[2], 10);

  // Check the ranges of month and year
  if (year < 1000 || year > 3000 || month === 0 || month > 12) return false;

  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  /* istanbul ignore else */
  if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
    monthLength[1] = 29;

  // Check the range of the day
  return day > 0 && day <= monthLength[month - 1];
};

export default isValidDate;
