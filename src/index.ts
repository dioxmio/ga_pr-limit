import * as core from '@actions/core';
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";
import { graphql } from "@octokit/graphql";


interface SearchQuery {
    search:  {
        issueCount: string;
    }
}

async function run () {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");

    const octokit = new Octokit({
        auth: GITHUB_TOKEN,
    });

    const { context } = github;

    const queryStr = `repo:${context.repo.owner}/${context.repo.repo} is:open is:pr author:${context.actor}`;

    const data: SearchQuery = await octokit.graphql(`
        query currentPRs($queryStr: String!) {
            search(query: $queryStr, type: ISSUE) {
                issueCount
            }
        }
    `, {
        queryStr
    });

    const MAX_PRS = core.getInput("MAX_PRS") || 10;
    
    if (data?.search?.issueCount > MAX_PRS) {
        core.setFailed('You reach the maxium number of PRs');
        
        
        process.exit(1);
    }

    console.log('updated');
    console.log('x', (octokit as any).issues);
    console.log(data);
}

run();
