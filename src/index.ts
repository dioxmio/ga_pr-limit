import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from "@octokit/core";



async function run () {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const octokit = new Octokit({
        auth: GITHUB_TOKEN,
    });

    const { context } = github;
    const { pull_request } = context.payload;

    const data = await octokit.graphql(`{
        viewer {
            repository(name: "ga_pr-limit") {
                pullRequests {
                    totalCount
                }
            }
        }
    }`)

    console.log('updated');
    console.log(data);
}

run();
