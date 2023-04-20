#!/usr/bin/env zx

import { echo } from 'zx/experimental';

$.verbose = true;

const query = await question('Enter a query to filter PRs by: ');

const getPrs = async (extra = '') => {
  const prsStr =
    await $`gh search prs ${query} ${extra} --state=open --repo=builder --owner=BuilderIO --app=dependabot --json=url,number,title`;

  /**
   * @type {Array<{url: string, number: number, title: string}>}
   */
  const prs = JSON.parse(prsStr.stdout);

  console.log(prsStr, prs);

  // exclude `BuilderIO/builder-internal` PRs
  const cleanedPrs = prs.filter(pr => pr.url.includes('BuilderIO/builder/pull'));
  return cleanedPrs;
};

const mergePrs = async () => {
  const prs = await getPrs();
  for (const pr of prs) {
    echo`merging PR: ${pr.url}: ${pr.title}`;
    try {
      const out1 = await $`gh pr review ${pr.number} --approve`;
      // enable auto-merge
      const out2 = await $`gh pr merge ${pr.number} --auto --squash`;
    } catch (error) {
      echo`ERROR merging PR: ${pr.url}: ${pr.title}`;
      echo`ERROR: ${error}`;
    }
  }
};

const rebasePrs = async () => {
  const prs = await getPrs();
  for (const pr of prs) {
    echo`commenting on PR: ${pr.url}: ${pr.title}`;
    try {
      // comment on the PR with `@dependabot rebase`
      const out1 = await $`gh pr comment ${pr.number} --body="@dependabot rebase"`;
    } catch (error) {
      echo`ERROR commenting on PR: ${pr.url}: ${pr.title}`;
      echo`ERROR: ${error}`;
    }
  }
};

const main = async () => {
  const action = await question('What do you want to do? [merge/rebase]: ');
  if (action === 'merge') {
    await mergePrs();
  } else if (action === 'rebase') {
    await rebasePrs();
  } else {
    console.log('Unknown action');
  }
};

main();
