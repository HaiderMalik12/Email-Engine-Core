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

const bulkSaveEmails = async function (emails) {
    const body = emails.flatMap(doc => [{ index: { _index: 'email_messages' } }, doc]);
    // @ts-ignore
    const savedEmailResponse = await client.bulk({ refresh: true, body });

    if (savedEmailResponse.errors) {
        const erroredDocuments = [];
        savedEmailResponse.items.forEach((action, i) => {
            const operation = Object.keys(action)[0];
            if (action[operation].error) {
                erroredDocuments.push({
                    status: action[operation].status,
                    error: action[operation].error,
                    operation: body[i * 2],
                    document: body[i * 2 + 1]
                });
            }
        });
        console.error('Bulk save errors:', erroredDocuments);
        throw new Error('Error saving emails to Elasticsearch');
    }
};

module.exports = {
    saveUser,
    saveEmailMessage,
    saveMailbox,
    getUserByEmail,
    bulkSaveEmails
};
