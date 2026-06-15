#!/usr/bin/env zx

/**
 * This script uses the gh CLI to dismiss open Dependabot security alerts for the
 * BuilderIO/builder repo (e.g. the ones at
 * https://github.com/BuilderIO/builder/security/dependabot).
 *
 * It asks the user for:
 * - a severity to filter by (low/moderate/high/critical, or all)
 * - a dismiss reason
 * - lists all matching open alerts and asks the user to confirm
 * - dismisses each alert
 *
 * NOTE: dismissing only hides the alert, it does not fix the dependency.
 */

import { question } from 'zx';
import { echo } from 'zx/experimental';

const REPO = 'BuilderIO/builder';

// GitHub-accepted dismiss reasons for Dependabot alerts.
const DISMISS_REASONS = ['tolerable_risk', 'no_bandwidth', 'not_used', 'inaccurate', 'fix_started'];

console.log('Welcome to the BuilderIO/builder Dependabot alert cleaner!');

async function getSeverity() {
  const answer = await question(
    'Which severity to dismiss? [low/moderate/high/critical/all] (moderate): '
  );
  const severity = answer.trim().toLowerCase() || 'moderate';
  const valid = ['low', 'moderate', 'high', 'critical', 'all'];
  if (!valid.includes(severity)) {
    throw new Error(`Invalid severity "${severity}". Choose one of: ${valid.join(', ')}`);
  }
  return severity;
}

async function getDismissReason() {
  const answer = await question(
    `Dismiss reason? [${DISMISS_REASONS.join('/')}] (tolerable_risk): `
  );
  const reason = answer.trim().toLowerCase() || 'tolerable_risk';
  if (!DISMISS_REASONS.includes(reason)) {
    throw new Error(`Invalid reason "${reason}". Choose one of: ${DISMISS_REASONS.join(', ')}`);
  }
  return reason;
}

/**
 * @returns {Promise<Array<{number: number, html_url: string, dependency: object, security_advisory: object}>>}
 */
const getAlerts = async severity => {
  const path =
    severity === 'all'
      ? `/repos/${REPO}/dependabot/alerts?state=open&per_page=100`
      : `/repos/${REPO}/dependabot/alerts?state=open&severity=${severity}&per_page=100`;

  // --paginate follows the Link headers; --slurp merges pages into one array.
  const alertsStr = await $`gh api --paginate --slurp ${path}`;

  /**
   * @type {Array<Array<object>> | Array<object>}
   */
  const parsed = JSON.parse(alertsStr.stdout);

  // --slurp yields an array of page-arrays; flatten to a single list.
  return parsed.flat();
};

const dismissAlert = async (alert, reason) => {
  const name = alert.dependency?.package?.name ?? 'unknown';
  console.log(`Dismissing alert #${alert.number} (${name})...`);
  try {
    await $`gh api --method PATCH /repos/${REPO}/dependabot/alerts/${alert.number} -f state=dismissed -f dismissed_reason=${reason}`;
    console.log(`Dismissed alert #${alert.number}.`);
  } catch (e) {
    console.log(`Error dismissing alert #${alert.number}.`);
    console.log(e);
  }
};

async function main() {
  const severity = await getSeverity();
  const reason = await getDismissReason();

  const alerts = await getAlerts(severity);

  console.log(`Found ${alerts.length} open ${severity} alert(s):`);
  alerts.forEach(alert => {
    const name = alert.dependency?.package?.name ?? 'unknown';
    const sev = alert.security_advisory?.severity ?? '?';
    const summary = alert.security_advisory?.summary ?? '';
    console.log(`#${alert.number} [${sev}] ${name} || ${summary}`);
  });

  if (alerts.length === 0) {
    echo`No matching alerts found, nothing to do`;
    return;
  }

  const confirm = await question(
    `Dismiss these ${alerts.length} alert(s) as "${reason}"? (yes/no): `
  );

  if (confirm !== 'yes') {
    throw new Error(`Script aborted.`);
  }

  // Dismiss sequentially to stay friendly with the API rate limit.
  for (const alert of alerts) {
    await dismissAlert(alert, reason);
  }
}

main();
