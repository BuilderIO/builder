#!/usr/bin/env zx

/**
 * This script uses the octokit SDK to approve & merge all open dependabot PRs for this BuilderIO/builder repo.
 * It asks the user for:
 * - a query to filter the PRs by
 * - lists all PRs that match the query, how many there are, and asks the user to confirm
 * - approves all PRs
 * - merges all PRs
 */

import Octokit from '@octokit/rest';
import { question } from 'zx';
import { echo } from 'zx/experimental';

// load the GITHUB_TOKEN from .env file
require('dotenv').config();

// authenticate Octokit with a personal access token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

console.log('Welcome to the BuilderIO/builder dependabot PR merger!');
console.log(`Using GITHUB_TOKEN: ${process.env.GITHUB_TOKEN}`);

let query = '';
async function getQuery() {
  // Ask the user for a query
  query = await question('Enter a query to filter PRs by: ');
}

const getPRs = async ({ isApproved }) => {
  const getQuery = isApproved =>
    `repo:BuilderIO/builder is:open state:open author:app/dependabot type:pr ${query} review:${
      isApproved ? 'approved' : 'required'
    }`;
  const { data: pullRequests } = await octokit.search.issuesAndPullRequests({
    q: getQuery(isApproved),
  });
  return pullRequests;
};

async function approve() {
  // List all unapproved PRs that match the query
  const unapprovedPullRequests = await getPRs({ isApproved: false });

  console.log(
    `Found ${unapprovedPullRequests.total_count} unapproved pull requests matching the query:`
  );
  unapprovedPullRequests.items.forEach(pr => {
    console.log(`${pr.html_url} || ${pr.title}`);
  });

  if (unapprovedPullRequests.total_count > 0) {
    // Confirm with the user
    let confirm = await question(
      `Are you sure you want to approve these ${unapprovedPullRequests.total_count} pull requests? (yes/no)`
    );

    if (confirm !== 'yes') {
      throw new Error(`Script aborted.`);
    }

    // Approve all PRs
    for (const pr of unapprovedPullRequests.items) {
      // approve the PR and print appropriate message
      console.log(`Approving ${pr.html_url}`);
      const resp = await octokit.pulls.createReview({
        owner: 'BuilderIO',
        repo: 'builder',
        pull_number: pr.number,
        event: 'APPROVE',
      });
      if (resp.status !== 200) {
        console.log(`Error approving ${pr.html_url}`);
        // print details
        console.log(resp);
      } else {
        console.log(`Approved ${pr.html_url}`);
      }
    }
  } else {
    echo`No unapproved PRs found, skipping approval step`;
  }
}

async function merge() {
  // List all unapproved PRs that match the query
  const approvedPullRequests = await getPRs({ isApproved: true });

  console.log(
    `Found ${approvedPullRequests.total_count} approved pull requests matching the query:`
  );
  approvedPullRequests.items.forEach(pr => {
    console.log(`${pr.html_url} || ${pr.title}`);
  });

  if (approvedPullRequests.total_count === 0) {
    throw new Error(`No approved PRs found, aborting`);
  }

  // Confirm with the user
  const confirm = await question(
    `Are you sure you want to merge these ${approvedPullRequests.total_count} pull requests? (yes/no)`
  );

  if (confirm !== 'yes') {
    throw new Error(`Script aborted.`);
  }

  let hasError = false;

  // Merge all PRs
  for (const pr of approvedPullRequests.items) {
    // merge the PR and print appropriate message
    console.log(`Merging ${pr.html_url}`);
    try {
      const resp = await octokit.pulls.merge({
        owner: 'BuilderIO',
        repo: 'builder',
        pull_number: pr.number,
        merge_method: 'squash',
      });
      if (resp.status !== 200) {
        hasError = true;
        console.log(`Error merging ${pr.html_url}`);
        // print details
        console.log(resp);
      } else {
        console.log(`Merged ${pr.html_url}`);
      }
    } catch (e) {
      hasError = true;
      console.log(`Error merging ${pr.html_url}`);
      // print details
      console.log(e);
    }
  }

  if (hasError) {
    // ask them if they want to try again
    const confirm = await question(
      `There was an error merging some PRs, would you like to try again? (yes/no)`
    );

    if (confirm === 'yes') {
      await merge();
    }
  }
}

async function main() {
  await getQuery();
  await approve();
  await merge();
}

main();
