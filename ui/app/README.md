
# Releases and showing a changelog

- The app shows a "changelog" modal that shows the CHANGELOG.md from the commit SHA at which the most recent release was built.
- Additionally, when a new version is published (via updating the version in package.json and deploying), a small badge will be displayed on the changelog item in the sidemenu until the user reads it.

This means that each release, there are two things to do:

1. Update [CHANGELOG.md](./CHANGELOG.md) with the latest changes for the release and push.
2. Run `npm version <minor|major|patch>` within app folder and push.
3. Deploy this versions and user will get a little badge on the changelog since a new version is out.

