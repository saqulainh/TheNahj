#!/usr/bin/env node
// Simple ingestion health checker used by CI/workflows.
// Expects env: SITE_URL (e.g. https://www.thenahj.live), MONITORING_WEBHOOK (optional),
// THRESHOLD_LAST_HOUR (numeric, default 1), MAX_MINUTES_SINCE (numeric, default 60)

const SITE_URL = process.env.SITE_URL || 'https://www.thenahj.live';
const WEBHOOK = process.env.MONITORING_WEBHOOK;
const THRESHOLD_LAST_HOUR = Number(process.env.THRESHOLD_LAST_HOUR || '1');
const MAX_MINUTES_SINCE = Number(process.env.MAX_MINUTES_SINCE || '60');

async function notify(payload) {
  if (!WEBHOOK) {
    console.log('MONITORING_WEBHOOK not set; would notify with:', JSON.stringify(payload));
    return;
  }
  try {
    await fetch(WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    console.log('Notification sent to webhook.');
  } catch (e) {
    console.error('Failed to send webhook:', e);
  }
}

async function main() {
  try {
    const res = await fetch(`${SITE_URL.replace(/\/$/, '')}/api/analytics/reflection/health`);
    const j = await res.json();
    if (!res.ok || !j.success) {
      await notify({ event: 'ingestion_health_error', message: 'Health endpoint returned error', detail: j });
      process.exit(0);
    }

    const recent = j.recent || {};
    const lastEventAt = recent.lastEventAt ? new Date(recent.lastEventAt) : null;
    const now = Date.now();
    const minutesSinceLast = lastEventAt ? Math.round((now - new Date(lastEventAt).getTime()) / 60000) : Infinity;

    let alert = false;
    const reasons = [];
    if (typeof recent.lastHour === 'number' && recent.lastHour < THRESHOLD_LAST_HOUR) {
      alert = true;
      reasons.push(`low_volume_last_hour=${recent.lastHour}`);
    }
    if (minutesSinceLast === Infinity || minutesSinceLast > MAX_MINUTES_SINCE) {
      alert = true;
      reasons.push(`stale_last_event=${minutesSinceLast}m`);
    }

    if (alert) {
      await notify({ event: 'ingestion_alert', reasons, recent });
    } else {
      console.log('Ingestion healthy:', recent);
    }
  } catch (e) {
    console.error('Health check failed:', e);
    await notify({ event: 'ingestion_check_failed', error: String(e) });
  }
}

main();
