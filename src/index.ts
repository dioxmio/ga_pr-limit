import * as core from '@actions/core';
import * as github from "@actions/github";
import { Octokit } from '@octokit/rest';

interface SearchQuery {
    search:  {
        issueCount: string;
    }
}

let octokit: Octokit;

function getClient() {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

    if (octokit) {
        return octokit;
    }

    octokit = new Octokit({ auth: GITHUB_TOKEN })
    return octokit;
}

async function takeActions() {
    const { context } = github;
    const MAX_PRS = core.getInput("MAX_PRS");

    const message = `You reached the limit of ${MAX_PRS} PRS`
    
    // closing the PR
    await getClient().pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
        state: 'closed'
    });

    // adding an explanatory comment
    await getClient().issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: message
    })

    // exist and make the action fail
    core.setFailed(message);
    process.exit(1);
} 

async function reachedLimitPRs() {
    const { context } = github;
    const MAX_PRS = core.getInput("MAX_PRS") || 10;

    const queryStr = `repo:${context.repo.owner}/${context.repo.repo} is:open is:pr author:${context.actor}`;
    const data: SearchQuery = await getClient().graphql(`
        query currentPRs($queryStr: String!) {
            search(query: $queryStr, type: ISSUE) {
                issueCount
            }
        }
    `, {
        queryStr
    });

    return data?.search?.issueCount > MAX_PRS;
}

async function run () {
    if (await reachedLimitPRs()) {
        takeActions();
    }
}

run();
