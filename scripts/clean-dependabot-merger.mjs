#!/usr/bin/env zx

import { echo } from 'zx/experimental';

$.verbose = true;

const query = await question('Enter a query to filter PRs by: ');

const prsStr =
  await $`gh search prs ${query} --state=open --repo=builder --owner=BuilderIO --app=dependabot --json=url,number,title`;

/**
 * @type {Array<{url: string, number: number, title: string}>}
 */
const prs = JSON.parse(prsStr.stdout);

// exclude `BuilderIO/builder-internal` PRs
const cleanedPrs = prs.filter(pr => pr.url.includes('BuilderIO/builder/pull'));

for (const pr of cleanedPrs) {
  echo`merging PR: ${pr.url}: ${pr.title}`;
  try {
    await $`gh pr review ${pr.number} --approve`;
    // enable auto-merge
    await $`gh pr merge ${pr.number} --auto --squash`;
  } catch (error) {
    echo`ERROR merging PR: ${pr.url}: ${pr.title}`;
    echo`ERROR: ${error}`;
  }
}
