const Habit = require('../models/Habit');

const defaultHabits = [
  { text: 'Use a steel bottle instead of plastic', category: 'daily', points: 5 },
  { text: 'Plant a small plant at home and take care of it', category: 'home', points: 10 },
  { text: 'Carry a cloth bag for shopping', category: 'sustainability', points: 5 },
  { text: 'Switch off lights when leaving the room', category: 'daily', points: 3 },
  { text: 'Compost kitchen waste in a small bin', category: 'home', points: 8 },
  { text: 'Use public transport or carpool once this week', category: 'sustainability', points: 7 }
];

async function getDailyHabit() {
  let habit = await Habit.findOne({ active: true }).sort({ createdAt: 1 });
  if (!habit) {
    await Habit.insertMany(defaultHabits);
    habit = await Habit.findOne({ active: true }).sort({ createdAt: 1 });
  }
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (24 * 60 * 60 * 1000));
  const all = await Habit.find({ active: true }).sort({ createdAt: 1 }).lean();
  const index = dayOfYear % Math.max(1, all.length);
  return all[index] || all[0] || defaultHabits[0];
}

module.exports = { getDailyHabit };
