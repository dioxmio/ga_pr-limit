import * as core from '@actions/core';
import * as github from '@actions/github';


async function run () {
    console.log('method invoked');

    const GITHUB_TOKEN = core.getInput("token");
    const octokit = github.getOctokit(GITHUB_TOKEN);

    const { context } = github;
    const { pull_request } = context.payload;

    console.log('finished');
}

run();
