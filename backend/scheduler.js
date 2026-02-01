/**
 * Automatic area alerts - AI-based priority
 * Runs every 6 hours. Sends notifications to area communities for High/Medium AQI locations.
 * No admin involvement - fully automatic.
 */
const cron = require('node-cron');
const { runAutomaticAreaAlerts } = require('./services/areaNotifications');

const CRON_SCHEDULE = process.env.AUTO_ALERT_CRON || '0 */6 * * *';

function startScheduler() {
  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      const results = await runAutomaticAreaAlerts();
      if (results.length > 0) {
        console.log(`[Auto alerts] Sent ${results.length} area notifications:`, results.map((r) => r.areaName || r.error));
      }
    } catch (err) {
      console.error('[Auto alerts] Error:', err.message);
    }
  });
  console.log('[Scheduler] Auto area alerts enabled (every 6 hours)');
}

module.exports = { startScheduler };
