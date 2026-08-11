#!/usr/bin/env zx

/**
 * This script uses the gh CLI to process all open dependabot PRs for the
 * BuilderIO/builder repo. It asks the user for a query to filter the PRs by,
 * then for each matching PR it:
 * - reviews (lists them and asks the user to confirm)
 * - approves
 * - enables auto-merge (squash, merges once CI passes)
 * - asks Dependabot to rebase (refreshes against main so CI re-runs and the
 *   queued auto-merge can fire)
 */

import { question } from 'zx';
import { echo } from 'zx/experimental';

console.log('Welcome to the BuilderIO/builder dependabot PR merger!');

let query = '';
async function getQuery() {
  // Ask the user for a query
  query = await question('Enter a query to filter PRs by: ');
}

/**
 * @returns {Promise<Array<{url: string, number: number, title: string}>>}
 */
const getPRs = async () => {
  // Only pass the query as a search term when non-empty; gh rejects empty terms.
  const searchTerms = [query].filter(Boolean);
  const prsStr =
    await $`gh search prs ${searchTerms} --repo=BuilderIO/builder --app=dependabot --state=open --limit=100 --json=url,number,title`;

  /**
   * @type {Array<{url: string, number: number, title: string}>}
   */
  const prs = JSON.parse(prsStr.stdout);

  // exclude PRs from other org repos
  return prs.filter(pr => pr.url.includes('BuilderIO/builder/pull'));
};

/**
 * Lists the matching PRs and asks the user to confirm before any action.
 * @returns {Promise<Array<{url: string, number: number, title: string}>>}
 */
async function review() {
  const prs = await getPRs();

  console.log(`Found ${prs.length} open dependabot pull requests matching the query:`);
  prs.forEach(pr => {
    console.log(`${pr.url} || ${pr.title}`);
  });

  if (prs.length === 0) {
    echo`No PRs found, nothing to do`;
    return [];
  }

  const confirm = await question(
    `Approve, enable auto-merge, and rebase these ${prs.length} pull requests? (yes/no): `
  );

  if (confirm !== 'yes') {
    throw new Error(`Script aborted.`);
  }

  return prs;
}

async function approve(prs) {
  const approvePr = async pr => {
    console.log(`Approving ${pr.url}...`);
    try {
      await $`gh pr review ${pr.number} --approve`;
      console.log(`Approved ${pr.url}.`);
    } catch (e) {
      console.log(`Error approving ${pr.url}.`);
      console.log(e);
    }
  };

  await Promise.all(prs.map(approvePr));
}

async function enableAutoMerge(prs) {
  const autoMergePr = async pr => {
    console.log(`Enabling auto-merge for ${pr.url}...`);
    try {
      // queues the squash-merge until CI passes
      await $`gh pr merge ${pr.number} --auto --squash`;
      console.log(`Auto-merge enabled for ${pr.url}.`);
    } catch (e) {
      console.log(`Error enabling auto-merge for ${pr.url}.`);
      console.log(e);
    }
  };

  await Promise.all(prs.map(autoMergePr));
}

async function forceMerge(prs) {
  // Merge sequentially: each squash merge advances `main`, so parallel merges
  // race and fail with "Base branch was modified".
  for (const pr of prs) {
    console.log(`Force-merging ${pr.url}...`);
    // one retry for the base-branch race
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        // --admin bypasses required checks/reviews and merges immediately
        await $`gh pr merge ${pr.number} --admin --squash`;
        console.log(`Force-merged ${pr.url}.`);
        break;
      } catch (e) {
        const output = `${e.stderr ?? ''} ${e.message ?? ''}`;
        if (attempt === 1 && output.includes('Base branch was modified')) {
          console.log(`Base branch changed, retrying ${pr.url}...`);
          continue;
        }
        console.log(`Error force-merging ${pr.url}.`);
        console.log(e);
        break;
      }
    }
  }
}

async function rebaseAll(prs) {
  for (const pr of prs) {
    await rebaseDependabot(pr.number);
  }
}

/**
 * comments `@dependabot rebase` on the given PR number
 */
async function rebaseDependabot(prNumber) {
  console.log(`Asking Dependabot to rebase: ${prNumber}`);
  try {
    await $`gh pr comment ${prNumber} --body="@dependabot rebase"`;
    console.log(`Rebased ${prNumber}`);
  } catch (e) {
    console.log(`Error rebasing ${prNumber}`);
    console.log(e);
  }
}

async function main() {
  await getQuery();
  const prs = await review();
  if (prs.length === 0) {
    return;
  }
  const mode = await question(
    'Force merge now (admin, bypasses CI) or auto-merge when CI passes? [force/auto]: '
  );

  await approve(prs);

  if (mode === 'force') {
    await forceMerge(prs);
  } else {
    await enableAutoMerge(prs);
    await rebaseAll(prs);
  }
}

main();
