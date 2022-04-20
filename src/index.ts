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
    const { pull_request } = context.payload;

    /*const graphqlWithAuth = octokit.graphql.defaults({
        headers: {
          authorization: `token ${GITHUB_TOKEN}`,
        },
    });*/
    

    const data = await octokit.graphql(`
        query currentPRs($owner: String!, $repo: String!) {
            viewer {
                repository(name: $repo) {
                    pullRequests {
                        totalCount
                    }
                }
            }
        }
    `, {
        owner: context.repo.owner,
        repo: context.repo.repo
    });

    

    console.log('updated');
    console.log(data);
}

run();
