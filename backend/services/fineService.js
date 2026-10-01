const DAY_IN_MS = 1000 * 60 * 60 * 24;

const startOfDay = (value) => {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const isPastDue = (dueDate, compareDate = new Date()) => startOfDay(compareDate) > startOfDay(dueDate);

const calculateFine = (dueDate, returnDate) => {
  const dueDay = startOfDay(dueDate);
  const returnDay = startOfDay(returnDate);
  const diff = Math.floor((returnDay - dueDay) / DAY_IN_MS);

  return diff > 0 ? diff * 10 : 0;
};

module.exports = { calculateFine, startOfDay, isPastDue };
