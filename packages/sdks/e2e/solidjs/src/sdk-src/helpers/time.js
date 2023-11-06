const MINUTE_TO_MILLESECONDS_MULTIPLIER = 6e4;

const getCurrentDatePlusMinutes = (minutes = 30) => new Date(Date.now() + minutes * MINUTE_TO_MILLESECONDS_MULTIPLIER);

export { getCurrentDatePlusMinutes }