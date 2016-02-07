Exponent Sentry Utilities
=========================

**Note: Please don't use this right now. Very experimental and possibly broken.**

This package performs two main functions:

* Provides `ExponentSentryClient`, which allows an application to easily set itself up to send any uncaught errors to Sentry (https://getsentry.com).
* Provides a script -- `publish-sentry-release` -- that will fetch the current JavaScript bundle and source map for an Exponent experience from XDE, and upload those artifacts to Sentry to allow for symbolication of crash reports.

### Sentry Client

To use the Sentry client, simply insert the following in `AppRegister.registerComponent(...)`:

```javascript
ExponentSentryClient.setupSentry([SENTRY DSN], [RELEASE], [EXPERIENCE ENTRY FILE])
```

`RELEASE` should be a version number or Git commit SHA that identifies a new Sentry release.

Example usage:

```javascript
AppRegistry.registerComponent('main', () => {
  const packageJSON = require('./package.json');
  ExponentSentryClient.setupSentry(
    `https://[api key here]@app.getsentry.com/[project id]`,
    packageJSON.version,
    packageJSON.main,
  );
  return App;
});
```

### "Publish Sentry Release" Script

To upload a new release:

```bash
publish-sentry-release \
  --platform [ios|android] \
  --team [SENTRY TEAM] \
  --project [SENTRY PROJECT] \
  --api-key [SENTRY API KEY]
```

You'll be prompted for your XDE port -- this can be found in XDE in the project URL display.

In addition, the script will ask you if you want to bump the version of your project (the version specified in your `package.json`). This is optional - but if you don't bump the version and there is an existing Sentry release with the same version number, the artifacts associated with that version will be overridden.
