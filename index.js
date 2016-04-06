/*global ErrorUtils:false*/

import { Platform } from 'react-native';

/**
 * ExponentJS Sentry Client/Plugin
 *
 * Configures Sentry for usage in an ExponentJS Experience
 *
 * Usage:
 *
 * ```
 * import ExponentSentryClient from '@exponentjs/sentry-utils';
 * ExponentSentryClient.setupSentry([SENTRY DSN], [RELEASE], [EXPERIENCE ENTRY FILE])
 * ```
 */
export default class ExponentSentryClient {
  static setupSentry(dsn, release, mainEntry) {
    if (__DEV__) {
       return false;
    }

    const sentryClient = new ExponentSentryClient();
    return sentryClient.install(dsn, release, mainEntry);
  }

  constructor() {
    const Raven = require('raven-js');
    this._Raven = Raven;
    this._initPlugin();
  }

  install(dsn, release, mainEntry) {
    this._mainEntry = mainEntry;
    // self.addEventListener('unhandledrejection', (err) => {
    //   Raven.captureException(err);
    // });

    // TODO @skevy handle Promise rejection tracking

    return this._Raven.config(dsn, { release }).install();
  }

  _initPlugin() {
    this._Raven.setTransport(this._getTransport());

    // Use data callback to strip device-specific paths from stack traces
    this._Raven.setDataCallback((data) => {
      if (data.culprit) {
        data.culprit = this._getBundleFilename(data.culprit);
      }

      if (data.exception) {
        // if data.exception exists, all of the other keys are guaranteed to exist
        data.exception.values[0].stacktrace.frames.forEach((frame) => {
          frame.filename = this._getBundleFilename(frame.filename);
        });
      }
    });

    const defaultHandler = ErrorUtils.getGlobalHandler &&
      ErrorUtils.getGlobalHandler() ||
      ErrorUtils._globalHandler;

    ErrorUtils.setGlobalHandler((...args) => {
      var error = args[0];
      defaultHandler(...args);
      this._Raven.captureException(error, {
        tags: {
          os: Platform.OS,
        },
      });
    });
  }

  _getTransport() {
    return (options) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = (e) => {
        if (request.readyState !== 4) {
          return;
        }

        if (request.status === 200) {
          if (options.onSuccess) {
            options.onSuccess();
          }
        } else {
          if (options.onError) {
            options.onError();
          }
        }
      };

      request.open('POST', options.url);
      // Sentry expects an Origin header when using HTTP POST w/ public DSN.
      // Just set a phony Origin value; only matters if Sentry Project is configured
      // to whitelist specific origins.
      request.setRequestHeader('X-Sentry-Auth',
        'Sentry sentry_version=' + options.auth.sentry_version +
        ', sentry_timestamp=' + Date.now() +
        ', sentry_client=' + options.auth.sentry_client +
        ', sentry_key=' + options.auth.sentry_key);
      request.setRequestHeader('Origin', 'react-native://');
      request.setRequestHeader('Content-Type', 'application/json');
      request.setRequestHeader('User-Agent', options.auth.sentry_client);
      request.send(JSON.stringify(options.data));
    };
  }

  _getBundleFilename(url) {
    return '/' + this._mainEntry.replace('.js', '.bundle');
  }
}
