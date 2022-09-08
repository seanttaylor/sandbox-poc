import passport from 'passport';
import LocalStrategy from 'passport-local';

/**
 * Exposes Express middleware for the Passport Local Strategy
 * @param {Object} sandbox - default sandboxed APIs
 * @module Plugin/PassportLocal
 */
export default function PluginPassportLocal(sandbox) {
  const events = sandbox.get('/plugins/events-authz');
  sandbox.plugin({
    extendsDefault: false,
    fn: myPlugin,
    name: '/plugins/vendor/passport/local',
  });

  /* *************** PLUGIN DEFINTION *************** */

  /**
   * Loads the plugin
   * @param {Object} userAuthn - an instance of the PluginUserAuthn interface
   * @param {Object} userService an instance of the StrategyUserService interface
   * @memberof module:Plugin/PassportLocal
   * @returns {Object}
   */
  function myPlugin({ userAuthn, userService }) {
    passport.use(new LocalStrategy({
      usernameField: 'emailAddress',
      passwordField: 'password',
      passReqToCallback: true,
      session: true,
    }, async (req, emailAddress, password, done) => {
      userService.setMediaType(req.headers.accept);
      // const { emailAddress, password } = req.body;

      try {
        const record = await userService.validateUserPassword({ emailAddress, password });
        const [validationRequest] = record.data;

        if (!validationRequest.isValid) {
          // const response = await userService.getErrorResponse(401);
          done(null, false, { message: 'Incorrect username or password.' });
          return;
        }

        const userRecord = await userService.getUserByEmail(emailAddress);
        const [user] = userRecord.data;
        const credential = await userAuthn.issueAuthnCredential({ user, role: 'user' });

        events.notify('application.authenticationCredentialIssued', credential);

        // const result = await userService.login(user);
        done(null, user);
      } catch (e) {
        done(null, false, { message: 'Incorrect username or password.' });
      }
    }));

    passport.serializeUser((user, cb) => {
      process.nextTick(() => {
        cb(null, { id: user.id, username: user.emailAddress });
      });
    });

    passport.deserializeUser((user, cb) => {
      process.nextTick(() => cb(null, user));
    });

    return passport;
  }
}
