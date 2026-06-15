#!/usr/bin/env zx

import { echo } from 'zx/experimental';

$.verbose = true;

const query = await question('Enter a query to filter PRs by: ');

const limitAnswer = await question('How many PRs to fetch? [30]: ');
const limit = Number(limitAnswer.trim()) || 30;

const offsetAnswer = await question('How many PRs to skip (offset)? [0]: ');
const offset = Number(offsetAnswer.trim()) || 0;

const getPrs = async (extra = '') => {
  // Only pass query/extra as search terms when non-empty; gh rejects empty terms.
  const searchTerms = [query, extra].filter(Boolean);
  // gh has no offset flag, so fetch offset+limit results and slice off the offset.
  const fetchCount = offset + limit;
  const prsStr =
    await $`gh search prs ${searchTerms} --state=open --repo=BuilderIO/builder --app=dependabot --sort=created --order=asc --limit=${fetchCount} --json=url,number,title,updatedAt`;

  /**
   * @type {Array<{url: string, number: number, title: string, updatedAt: string}>}
   */
  const prs = JSON.parse(prsStr.stdout);

  console.log(prsStr, prs);

  // Apply offset/limit on the raw, globally-ordered results so the window
  // matches the sort order.
  return prs.slice(offset, offset + limit);
};

const mergePrs = async () => {
  const prs = await getPrs();
  for (const pr of prs) {
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
};

const messageDependabot = async (command = 'rebase') => {
  const prs = await getPrs();
  for (const pr of prs) {
    echo`commenting on PR: ${pr.url}: ${pr.title}`;
    try {
      // comment on the PR with `@dependabot rebase`
      await $`gh pr comment ${pr.number} --body="@dependabot ${command}"`;
    } catch (error) {
      echo`ERROR commenting on PR: ${pr.url}: ${pr.title}`;
      echo`ERROR: ${error}`;
    }
  }
};

const closePrs = async () => {
  const prs = await getPrs();
  for (const pr of prs) {
    echo`closing PR: ${pr.url}: ${pr.title}`;
    try {
      await $`gh pr close ${pr.number}`;
    } catch (error) {
      echo`ERROR closing PR: ${pr.url}: ${pr.title}`;
      echo`ERROR: ${error}`;
    }
  }
};

const main = async () => {
  const action = await question('What do you want to do? [merge/msg/close]: ');
  if (action === 'merge') {
    await mergePrs();
  } else if (action === 'close') {
    await closePrs();
  } else if (action === 'msg') {
    // get msg from user
    const command = await question('What do you want to say to dependabot? [rebase]: ');
    await messageDependabot(command);
  } else {
    console.log('Unknown action');
  }
};

main();
