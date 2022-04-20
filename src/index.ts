import * as core from '@actions/core';
import * as github from '@actions/github';


async function run () {
    const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const { context } = github;
    const { pull_request } = context.payload;

    const data = await octokit.graphql(`
        viewer {
            repository(name: "lingoda") {
                pullRequests {
                    totalCount
                }
            }
        }
    `)

    console.log('finished');
    console.log(data);
}

run();
