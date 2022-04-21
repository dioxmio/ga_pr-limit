import * as core from '@actions/core';
import * as github from "@actions/github";
import { Octokit } from '@octokit/rest';

interface SearchQuery {
    search:  {
        issueCount: string;
    }
}

interface PullRequestIdQuery {
    repository:  {
        pullRequest: {
            ID: string;
        }
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
    
    // getting the PR ID indentifier
    const data: PullRequestIdQuery = await getClient().graphql(`
        query($name: String!, $owner: String!, $issue: Int!) {
            repository(name: $name, owner: $owner) {
                pullRequest(number: $issue) {
                    id
                }
            }
        }
    `, {
        name: context.repo.repo,
        owner: context.repo.owner,
        issue: context.issue.number,
    });

    // adding comment + closing PR
    await getClient().graphql(`
        mutation($id: ID!) {
            closePullRequest(input: { pullRequestId: $id}) {
                pullRequest {
                    url
                } 
            }
            
            addComment(input: { body: "xxx", subjectId: $id}) {
                clientMutationId
            }
        }
    `, {
        id: data.repository.pullRequest.ID,
        body: message
    });

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
