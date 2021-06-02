# Sifchain UI

| script                   | description                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| `yarn dev`               | Run the view app in development mode hotloading changes                                     |
| `yarn build`             | Build a deployable app to the `app/dist` folder                                             |
| `yarn start`             | Serve the deployable app from the `app/dist` folder                                         |
| `yarn test`              | Run unit and integration tests                                                              |
| `yarn test --tag [tag]`  | Run unit and integration tests against a particular tag (develop/master/sifnode commit etc) |
| `yarn stack`             | Run backing services based on the latest sifnode release                                    |
| `yarn lint`              | Lint the code                                                                               |
| `yarn lint --quick`      | Quick lint staged code (mainly used in our pre-commit hook)                                 |
| `yarn e2e`               | Run end to end tests against code built in `app/dist`                                       |
| `yarn e2e --debug`       | Run end to end tests in debug mode against the `dev` server. (Good for writing tests)       |
| `yarn e2e --tag [tag]`   | Run end to end tests against a particular tag (develop/master/sifnode commit etc)           |
| `yarn storybook`         | Launch storybook                                                                            |
| `yarn storybook --build` | Build storybook to the `storybook-static` folder                                            |
| `yarn advance`           | Advance the blockchain by the given amount of blocks. Eg. `yarn advance 51`                 |

Running a command with the `--help` flag will display a help message explaining what the command does.
