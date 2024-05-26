var graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = {
  getUserDetails: async function (msalClient, userId) {
    const client = getAuthenticatedClient(msalClient, userId);

    const user = await client
      .api('/me')
      .select('displayName,mail,mailboxSettings,userPrincipalName')
      .get();
    return user;
  },

  // <GetCalendarViewSnippet>
  getCalendarView: async function (msalClient, userId, start, end, timeZone) {
    const client = getAuthenticatedClient(msalClient, userId);

    return client
      .api('/me/calendarview')
      // Add Prefer header to get back times in user's timezone
      .header('Prefer', `outlook.timezone="${timeZone}"`)
      // Add the begin and end of the calendar window
      .query({
        startDateTime: encodeURIComponent(start),
        endDateTime: encodeURIComponent(end)
      })
      // Get just the properties used by the app
      .select('subject,organizer,start,end')
      // Order by start time
      .orderby('start/dateTime')
      // Get at most 50 results
      .top(50)
      .get();
  },
  // </GetCalendarViewSnippet>
  // <CreateEventSnippet>
  createEvent: async function (msalClient, userId, formData, timeZone) {
    const client = getAuthenticatedClient(msalClient, userId);

    // Build a Graph event
    const newEvent = {
      subject: formData.subject,
      start: {
        dateTime: formData.start,
        timeZone: timeZone
      },
      end: {
        dateTime: formData.end,
        timeZone: timeZone
      },
      body: {
        contentType: 'text',
        content: formData.body
      }
    };

    // Add attendees if present
    if (formData.attendees) {
      newEvent.attendees = [];
      formData.attendees.forEach(attendee => {
        newEvent.attendees.push({
          type: 'required',
          emailAddress: {
            address: attendee
          }
        });
      });
    }

    // POST /me/events
    await client
      .api('/me/events')
      .post(newEvent);
  },
  // </CreateEventSnippet>

  fetchEmails: async function (msalClient, userId) {
    try {
      const client = getAuthenticatedClient(msalClient, userId);
      console.log('Fetching emails for user ID:', userId);

      const messages = await client
        .api('/me/mailFolders/inbox/messages')
        .select('subject,from,receivedDateTime,isRead,bodyPreview')
        .orderby('receivedDateTime DESC')
        .top(50)  // Fetch the top 50 emails. Adjust as needed.
        .get();

      if (!messages.value || messages.value.length === 0) {
        console.log('No emails found in the inbox.');
        return [];
      }
      console.log('Fetched emails:', JSON.stringify(messages));

      return messages;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw new Error('Access is denied. Check credentials and try again.');
    }
  }
};

function getAuthenticatedClient(msalClient, userId) {
  if (!msalClient || !userId) {
    throw new Error(
      `Invalid MSAL state. Client: ${msalClient ? 'present' : 'missing'}, User ID: ${userId ? 'present' : 'missing'}`);
  }

  const client = graph.Client.init({
    authProvider: async (done) => {
      try {
        const account = await msalClient
          .getTokenCache()
          .getAccountByHomeId(userId);

        if (account) {
          const scopes = process.env.OAUTH_SCOPES || 'https://graph.microsoft.com/.default';
          const response = await msalClient.acquireTokenSilent({
            scopes: scopes.split(','),
            redirectUri: process.env.OAUTH_REDIRECT_URI,
            account: account
          });

          console.log('Access Token:', response.accessToken);
          console.log('Scopes:', response.scopes);
          console.log('Expires On:', new Date(response.expiresOn * 1000));

          done(null, response.accessToken);
        } else {
          throw new Error('No account found for the given userId.');
        }
      } catch (err) {
        console.error('Error acquiring token silently:', err);
        done(err, null);
      }
    }
  });

  return client;
}