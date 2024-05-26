const client = require('../config/elasticsearchConfig');

const saveUser = async (user) => {
    await client.index({
        index: 'users',
        body: user
    });
};

const saveEmailMessage = async (message) => {
    await client.index({
        index: 'email_messages',
        body: message
    });
};

const saveMailbox = async (mailbox) => {
    await client.index({
        index: 'mailboxes',
        body: mailbox
    });
};
const getUserByEmail = async (email) => {
    const userSearchResults = await client.search({
        index: 'users',
        body: {
            query: {
                match: { email }
            }
        }
    });

    // @ts-ignore
    if (userSearchResults.hits.total.value > 0) {
        return userSearchResults.hits.hits[0]._source;
    }
    return null;
};

module.exports = {
    saveUser,
    saveEmailMessage,
    saveMailbox,
    getUserByEmail
};
