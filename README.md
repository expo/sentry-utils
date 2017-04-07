Expo Sentry Utilities
=====================

This package performs two main functions:

* Provides `ExpoSentryClient`, which allows an application to easily set itself up to send any uncaught errors to [Sentry](https://sentry.io).
* Provides a script -- `publish-sentry-release` -- that will fetch the current JavaScript bundle and source map for an Expo experience from XDE or `exp`, and upload those artifacts to Sentry to allow for symbolication of crash reports.

### Installation
Run `npm install --save @expo/sentry-utils` or `yarn add @expo/sentry-utils` to
install and add to your `package.json`. This also installs `raven-js`.

### Sentry Client

Set up the client as follows during the initialization of your app:

```javascript
ExpoSentryClient.setupSentry([SENTRY DSN], [RELEASE], [EXPERIENCE ENTRY FILE])
```

A good place to do this is in the `constructor` of your root component. `RELEASE` should be a version number or Git commit SHA that identifies a new Sentry release.

Example usage:

```javascript
import ExpoSentryClient from '@expo/sentry-utils';
const packageJSON = require('./package.json');
ExpoSentryClient.setupSentry(
  `https://[api key here]@app.getsentry.com/[project id]`,
  packageJSON.version,
  packageJSON.main,
);

// send message
ExpoSentryClient.logWarning(new Error('Testing sentry!'));

// send exception
const Raven = require('raven-js');
Raven.captureException(new Error('Testing Sentry!'));
```

Before using this for the first time you will need to publish at least one release as shown below.

### "Publish Sentry Release" Script

To upload a new release:

```bash
publish-sentry-release \
  --platform [ios|android] \
  --team [SENTRY TEAM] \
  --project [SENTRY PROJECT] \
  --auth-token [SENTRY AUTH TOKEN]
```

The script will look for `package.json` your current working directory.
Either run this command from the root of your project directory (assuming
`package.json` and `node_modules` are in the root) with
`node_modules/.bin/publish-sentry-release`, or add it as a script in your
`package.json`.

Find out about your Sentry auth token [on this page](https://docs.sentry.io/api/auth/).

You'll be prompted for your XDE port -- this can be found in XDE in the project URL display.

In addition, the script will ask you if you want to bump the version of your project (the version specified in your `package.json`). This is optional - but if you don't bump the version and there is an existing Sentry release with the same version number, the artifacts associated with that version will be overridden.
