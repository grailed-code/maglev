# 🚄 Maglev

_Safe, smooth, reliable, magnet-powered deployments._

🚄 Maglev is an automated tool for regularly deploying code. It looks at the most recent green source branch builds in Codeship, compares them to the current slug on Heroku, and finds the best available code to deploy. After the deploy is started, it will post a message in Slack with a list of all of the commits it is deploying.

## Emergency Brake

If you'd like to stop the deploy train from running, you can set the `EMERGENCY_BRAKE` environment variable to `"ENGAGED"`. Any other value, and the train will run.

## Contributing

### Installation

To get started contributing:

```
brew install yarn
yarn install
yarn test
yarn dev:run
```

### Environment

The following environment variables are expected to be set for `yarn dev:run` to work:

- For Codeship: `CODESHIP_USERNAME`, `CODESHIP_PASSWORD`, `CODESHIP_ORGANIZATION_ID`, `CODESHIP_PROJECT_ID`
- For Heroku: `HEROKU_ACCESS_TOKEN`, `HEROKU_APP_NAME`
- For Github: `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_ACCESS_TOKEN`
- For Slack: `SLACK_API_TOKEN`
- Other: `SOURCE_BRANCH`, `EMERGENCY_BRAKE`

### Technologies

🚄 Maglev is built using [Typescript](https://www.typescriptlang.org/) and [`fp-ts`](https://gcanti.github.io/fp-ts/).

#### Typescript

[TypeScript in 5 Minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) is a great introduction to Typescript and the _Handbook_, starting with [Basic Types](https://www.typescriptlang.org/docs/handbook/basic-types.html) provides a great reference.

#### `fp-ts`

`fp-ts` is a fantastic library for using a more functional approach in Typescript:

> The goal of `fp-ts` is to empower developers to write pure FP apps and libraries built atop higher order abstractions. It includes the most popular data types, type classes, and abstractions from languages like Haskell, PureScript, and Scala.

[via [Core Concepts](https://gcanti.github.io/fp-ts/introduction/core-concepts)]

A great place to get started with `fp-ts` is in Dave Taylor's _Exploring `fp-ts`_ series:

- [Working with Nullable Values](https://davetayls.me/blog/2018/05/20/fp-ts-01-working-with-nullable-values)
- [Handling Error Cases](https://davetayls.me/blog/2018/06/09/fp-ts-02-handling-error-cases)

Another excellent series to build good understanding is Giulio Canti's _Getting Started with `fp-ts`_, which begins with [a look at `Eq`](https://dev.to/gcanti/getting-started-with-fp-ts-setoid-39f3). Giulio is the author of `fp-ts` and does a great job of explaining what is going on under the hood.

#### Third-Party APIs

Currently, 🚄 Maglev uses the following services to coordinate deploys:

- [Codeship](https://apidocs.codeship.com/v2/introduction), for identifying which commits have successfully passed CI;
- [Github](https://developer.github.com/v3/), for doing comparisons across commits and grabbing the code to be deployed;
- [Heroku](https://devcenter.heroku.com/articles/platform-api-reference), as the destination for all deploys; and
- [Slack](https://api.slack.com/), as the destination for all notifications.
