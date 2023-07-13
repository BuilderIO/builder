const MINUTE_TO_MILLESECONDS_MULTIPLIER = 60000;

export const getCurrentDatePlusMinutes = (minutes = 30) =>
  new Date(Date.now() + minutes * MINUTE_TO_MILLESECONDS_MULTIPLIER);
