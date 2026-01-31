function getTasksForLocation(location) {
  const tasks = ['Clean area and collect waste', 'Plant trees/saplings'];
  if (location.hasPond) tasks.push('Clean pond and remove debris');
  if (location.garbageLevel === 'high') tasks.push('Segregate and dispose waste properly');
  return tasks;
}

module.exports = { getTasksForLocation };
