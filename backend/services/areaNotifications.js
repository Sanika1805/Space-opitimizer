/**
 * Area notifications - ported from Task1.ipynb
 * For each location with AQI data, create notifications for users in that area
 * Priority: Low (0-120), Medium (121-155), High (156+)
 * Area-wise community: users matched by region, area, or subscribedAreas
 */
const Notification = require('../models/Notification');
const User = require('../models/User');
const Location = require('../models/Location');
const { setPriorityFromAqi } = require('./aiPriority');
const { getPriorityLocations } = require('./aiPriority');
const { createPostForAreaAlert } = require('./communityService');

const MIN_ALERT_INTERVAL_MS = 24 * 60 * 60 * 1000;

function getMessageForPriority(priority, areaName, aqi) {
  const timeStr = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  if (priority === 'High') {
    return `⚠ High AQI Alert!\nArea: ${areaName}\nAQI: ${aqi}\nPriority: High\nTime: ${timeStr}\n\nConsider organizing a cleaning drive soon.`;
  }
  if (priority === 'Medium') {
    return `⚠ Medium AQI Warning\nArea: ${areaName}\nAQI: ${aqi}\nPriority: Medium\nTime: ${timeStr}\n\nMonitor and plan cleaning if needed.`;
  }
  return `✅ AQI Normal\nArea: ${areaName}\nAQI: ${aqi}\nPriority: Low\nTime: ${timeStr}\n\nKeep up the good work!`;
}

async function sendAreaAlert(locationId) {
  const location = await Location.findById(locationId);
  if (!location) throw new Error('Location not found');

  const aqi = location.aqi ?? 100;
  const aqiPriority = setPriorityFromAqi(aqi);
  const areaName = location.name;
  const region = location.region;

  const title = aqiPriority === 'High'
    ? `⚠ High AQI Alert: ${areaName}`
    : aqiPriority === 'Medium'
      ? `⚠ Medium AQI: ${areaName}`
      : `AQI Update: ${areaName}`;

  const body = getMessageForPriority(aqiPriority, areaName, aqi);

  const users = await User.find({
    $or: [
      { region: { $in: [region, areaName] } },
      { area: { $in: [region, areaName] } },
      { subscribedAreas: { $in: [region, areaName] } }
    ],
    role: { $in: ['user', 'incharge'] }
  }).select('_id');

  const notifications = users.map((u) => ({
    user: u._id,
    title,
    body,
    type: 'area_alert',
    location: locationId,
    areaName,
    aqi,
    aqiPriority
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
    await Location.findByIdAndUpdate(locationId, { lastAreaAlertAt: new Date() });
  }
  createPostForAreaAlert(locationId, title, body, aqiPriority, aqi).catch(() => {});
  return { sent: notifications.length, aqiPriority, areaName };
}

async function runAutomaticAreaAlerts() {
  const locations = await getPriorityLocations({ limit: 100 });
  const now = new Date();
  const results = [];

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const toAlert = locations
    .filter((loc) => {
      const p = loc.aqiPriority || setPriorityFromAqi(loc.aqi);
      if (p === 'Low') return false;
      const lastAt = loc.lastAreaAlertAt ? new Date(loc.lastAreaAlertAt) : null;
      const tooSoon = lastAt && now - lastAt < MIN_ALERT_INTERVAL_MS;
      return !tooSoon;
    })
    .sort((a, b) => {
      const pa = priorityOrder[a.aqiPriority] ?? 2;
      const pb = priorityOrder[b.aqiPriority] ?? 2;
      if (pa !== pb) return pa - pb;
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    });

  for (const loc of toAlert) {
    try {
      const r = await sendAreaAlert(loc._id);
      results.push(r);
    } catch (err) {
      results.push({ error: err.message, areaName: loc.name });
    }
  }
  return results;
}

async function sendAllAreaAlerts(regionFilter) {
  const filter = regionFilter ? { region: regionFilter } : {};
  const locations = await Location.find(filter).lean();
  const results = [];

  for (const loc of locations) {
    try {
      const r = await sendAreaAlert(loc._id);
      results.push(r);
    } catch (err) {
      results.push({ error: err.message, areaName: loc.name });
    }
  }
  return results;
}

module.exports = { sendAreaAlert, sendAllAreaAlerts, runAutomaticAreaAlerts };
