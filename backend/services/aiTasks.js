function getTasksForLocation(location) {
  const tasks = ['Clean area and collect waste', 'Plant trees/saplings'];
  if (location.hasPond) tasks.push('Clean pond and remove debris');
  if (location.garbageLevel === 'high') tasks.push('Segregate and dispose waste properly');
  return tasks;
}

/**
 * AI-generated drive instructions: what to do and how to do
 */
function getDriveInstructions(location, drive) {
  const loc = location && typeof location.toObject === 'function' ? location.toObject() : (location || {});
  const whatToDo = getTasksForLocation(loc);
  const howToDo = [
    'Wear gloves and closed shoes. Bring a bag for waste.',
    'Work in pairs for safety. Stay within visible range of the group.',
    'Separate plastic, metal and organic waste if bins are available.',
    'Water saplings after planting. Do not uproot or damage existing plants.',
    'Report any injury or hazard to the incharge immediately.'
  ];
  if (loc.hasPond) {
    howToDo.push('Do not enter deep water. Remove debris from the bank only.');
  }
  if (loc.garbageLevel === 'high') {
    howToDo.push('Use a stick to check for sharp objects before picking. Dispose in designated bins.');
  }
  return { whatToDo, howToDo };
}

module.exports = { getTasksForLocation, getDriveInstructions };
