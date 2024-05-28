// @ts-nocheck
const graph = require('../graph');
const router = require('express-promise-router').default();
const elasticsearchService = require('../services/elasticSearchService');

/* GET auth callback. */
router.get('/signin', async function (req, res) {
  const scopes =
    process.env.OAUTH_SCOPES || 'https://graph.microsoft.com/.default';
  const urlParameters = {
    scopes: scopes.split(','),
    redirectUri: process.env.OAUTH_REDIRECT_URI,
  };

  try {
    const authUrl = await req.app.locals.msalClient.getAuthCodeUrl(
      urlParameters
    );
    res.redirect(authUrl);
  } catch (error) {
    console.log(`Error: ${error}`);
    req.flash('error_msg', {
      message: 'Error getting auth URL',
      debug: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
    res.redirect('/');
  }
});

// <CallbackSnippet>
router.get('/redirect', async function (req, res) {
  const scopes =
    process.env.OAUTH_SCOPES || 'https://graph.microsoft.com/.default';
  const tokenRequest = {
    code: req.query.code,
    scopes: scopes.split(','),
    redirectUri: process.env.OAUTH_REDIRECT_URI,
  };

  if (!tokenRequest.code) {
    req.flash('error_msg', {
      message: 'Authorization code is missing in the request.',
    });
    return res.redirect('/');
  }

  try {
    const response = await req.app.locals.msalClient.acquireTokenByCode(
      tokenRequest
    );

    // Save the user's homeAccountId in their session
    req.session.userId = response.account.homeAccountId;

    const user = await graph.getUserDetails(
      req.app.locals.msalClient,
      req.session.userId
    );

    const userRecord = {
      email: user.mail || user.userPrincipalName,
      localId: response.account.homeAccountId,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    };

    let userData = await elasticsearchService.getUserByEmail(userRecord.email);
    if (!userData) {
      userRecord.fetchedEmails = false;
      await elasticsearchService.saveUser(userRecord);
      userData = await elasticsearchService.getUserByEmail(userRecord.email);
    }

    if (userData.fetchedEmails === false) {
      const emails = await graph.fetchEmails(
        req.app.locals.msalClient,
        req.session.userId
      );
      // Prepare emails for bulk saving
      const emailDocs = emails.map(email => ({
        userId: req.session.userId,
        messageId: email.id,
        subject: email.subject,
        body: email.bodyPreview,
        receivedDate: email.receivedDateTime
      }));
      // Bulk save emails to Elasticsearch
      await elasticsearchService.bulkSaveEmails(emailDocs);
      console.log('Emails fetched and saved:', emails.length);
      await elasticsearchService.updateFetchedEmails(userData.email, true);
    }
    // Add the user to user storage
    req.app.locals.users[req.session.userId] = {
      displayName: user.displayName,
      email: user.mail || user.userPrincipalName,
      timeZone: user.mailboxSettings.timeZone,
    };

    // Create webhook subscription after successful login
    await graph.createSubscription(req.app.locals.msalClient, req.session.userId);

  } catch (error) {
    console.error(`Error completing authentication: ${error}`);
    // @ts-ignore
    if (error.body) {
      // @ts-ignore
      console.error(`Elasticsearch error details: ${JSON.stringify(error.body.error)}`);
    }
    req.flash('error_msg', {
      message: 'Error completing authentication',
      debug: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    });
  }

  res.redirect('/');
});
// </CallbackSnippet>

router.get('/signout', async function (req, res) {
  // Sign out
  if (req.session.userId) {
    // Look up the user's account in the cache
    const accounts = await req.app.locals.msalClient
      .getTokenCache()
      .getAllAccounts();

    const userAccount = accounts.find(
      (a) => a.homeAccountId === req.session.userId
    );

    // Remove the account
    if (userAccount) {
      req.app.locals.msalClient.getTokenCache().removeAccount(userAccount);
    }
  }

  // Destroy the user's session
  req.session.destroy(function () {
    res.redirect('/');
  });
});

module.exports = router;
