import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from "@octokit/core";
import { graphql } from "@octokit/graphql";




async function run () {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const octokit = new Octokit({
        auth: GITHUB_TOKEN,
    });

    const { context } = github;
    

    /*const graphqlWithAuth = octokit.graphql.defaults({
        headers: {
          authorization: `token ${GITHUB_TOKEN}`,
        },
    });*/
    

    const queryStr = `repo:${context.repo.owner}/${context.repo.repo} is:open is:pr author:${context.actor}`;

    console.log(queryStr);

    const data = await octokit.graphql(`
        query currentPRs($queryStr: String!) {
            search(query: $queryStr, type: ISSUE) {
                issueCount
            }
        }
    `, {
        queryStr
    });

    console.log('updated');
    console.log(data);
}

run();
