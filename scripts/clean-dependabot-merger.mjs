#!/usr/bin/env zx

const query = await question('Enter a query to filter PRs by: ');

const prsStr =
  await $`gh search prs ${query} --state=open --repo=builder --owner=BuilderIO --app=dependabot --json=url,number`;

/**
 * @type {Array<{url: string, number: number}>}
 */
const prs = JSON.parse(prsStr.stdout);

// exclude `BuilderIO/builder-internal` PRs
const cleanedPrs = prs.filter(pr => pr.url.includes('BuilderIO/builder/pull'));

for (const pr of cleanedPrs) {
  await $`gh pr review ${pr.number} --approve`;
  // enable auto-merge
  await $`gh pr merge ${pr.number} --auto --squash`;
}
