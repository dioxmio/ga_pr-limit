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

async function takeActions(prId: string) {
    const MAX_PRS = core.getInput("MAX_PRS");

    const message = `You reached the limit of ${MAX_PRS} PRS`
    
    // adding comment + closing PR
    await getClient().graphql(`
        mutation($id: ID!, $body: String!) {
            closePullRequest(input: { pullRequestId: $id}) {
                pullRequest {
                    url
                } 
            }
            
            addComment(input: { body: $body, subjectId: $id}) {
                clientMutationId
            }
        }
    `, {
        id: prId,
        body: message
    });

    // exist and make the action fail
    core.setFailed(message);
    process.exit(1);
} 

async function reachedLimitPRs(actor: string) {
    const { context } = github;
    const MAX_PRS = core.getInput("MAX_PRS") || 10;

    const queryStr = `repo:${context.repo.owner}/${context.repo.repo} is:open is:pr author:${actor}`;
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

interface PullRequestIdQuery {
    repository:  {
        pullRequest: {
            id: string;
            author: {
                login: string;
            }
        }
    }
}
async function getPRInfo() {
    const { context } = github;
    
    const data: PullRequestIdQuery = await getClient().graphql(`
        query($name: String!, $owner: String!, $issue: Int!) {
            repository(name: $name, owner: $owner) {
                pullRequest(number: $issue) {
                    id,
                    author {
                        login
                    }
                }
            }
        }
    `, {
        name: context.repo.repo,
        owner: context.repo.owner,
        issue: context.issue.number,
    });

    const prId = data?.repository?.pullRequest?.id;
    const login = data?.repository?.pullRequest?.author?.login;

    if (!prId || !login) {
        core.setFailed('failed to get info from PR');
        process.exit(1);
    }

    return {
        prId,
        login
    }
}

async function run () {

    const info = await getPRInfo();

    if (await reachedLimitPRs(info.login)) {
        takeActions(info.prId);
    }
}

run();
