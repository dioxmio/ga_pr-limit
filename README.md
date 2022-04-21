# ga_pr-limit
Creating an action to block the number of PRs any team member can use.

The motivation behind this action is to limit the number of PRs any contributor can work on. This action puts a limit to multitasking and put the focus on ownership on already opened PRS.

If an author exceeds that limit the PR will be automatically closed and a comment will be added to it.

## Arguments

| name    | description                              | required | default         | format            |
|:--------|:-----------------------------------------|:---------|:----------------|:------------------|
| `GITHUB_TOKEN` | GitHub token                         | `true`   | -             | `string`   |
| `MAX_PRS` | Max number of PRs per actor               | `true`   | -             | `string`   |
| `EXCLUDE` | Excluding actors form limit       | `false`  | -             | `string`   |

## Example

```yaml
name: Test

on:
  pull_request:
    types: [opened, reopened]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v3
      - name: PR Limit
        uses: dioxmio/ga_pr-limit@v1
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          MAX_PRS: 3
          EXCLUDE: 'actor1,actor2'
```
## LICENSE

MIT LICENSE