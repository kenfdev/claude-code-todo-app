Please create a pull request based on the current changes compared to the main branch.

The issues to close are: $ARGUMENTS (comma-separated issue numbers)

Follow these steps:

1. **Check Current Changes**

   - Use `git status` and `git diff main` to see what changes exist
   - Ensure there are staged or unstaged changes to include in the PR

2. **Create Pull Request**

   - Push the branch to the repository
   - Create a pull request using `gh pr create` with:
     - A clear title summarizing the changes
     - A description that includes "Closes #<issue_number>" for each issue in $ARGUMENTS

3. **PR Description Format**
   - Include a summary of what was changed
   - ALWAYS write the description in Japanese.
   - Add "Closes #<issue_number>" statements for each issue (parsed from $ARGUMENTS)
   - Example: If $ARGUMENTS is "123,456", include "Closes #123" and "Closes #456" in the description

Remember:

- Parse $ARGUMENTS as comma-separated issue numbers
- Use "Closes #<number>" format to automatically close issues when PR is merged
- Base the PR on current changes compared to main branch
