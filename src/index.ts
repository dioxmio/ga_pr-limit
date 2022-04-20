import core from '@actions/core';
import github from "@actions/github";
import { Octokit } from '@octokit/rest';

interface SearchQuery {
    search:  {
        issueCount: string;
    }
}

let octokit: Octokit;

function getOctokit() {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

    if (octokit) {
        return octokit;
    }    

    octokit = new Octokit({ auth: GITHUB_TOKEN })

    return octokit;
}

async function takeActions() {
    const { context } = github;

    await getOctokit().pulls.update({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
        state: 'closed'
    });

    await getOctokit().issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: 'You reach the maximum number of open PRS'
    })

    core.setFailed('You reach the maxium number of PRs');
    
    process.exit(1);
} 

async function reachedLimitPRs() {
    const { context } = github;

    const queryStr = `repo:${context.repo.owner}/${context.repo.repo} is:open is:pr author:${context.actor}`;

    const data: SearchQuery = await getOctokit().graphql(`
        query currentPRs($queryStr: String!) {
            search(query: $queryStr, type: ISSUE) {
                issueCount
            }
        }
    `, {
        queryStr
    });

    const MAX_PRS = core.getInput("MAX_PRS") || 10;
    
    return data?.search?.issueCount > MAX_PRS;
}

async function run () {
    if (await reachedLimitPRs()) {
        takeActions();
    }
}

run();
