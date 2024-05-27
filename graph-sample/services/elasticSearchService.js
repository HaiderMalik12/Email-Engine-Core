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

const updateLastSyncTime = async function (email, lastSyncTime) {
    await client.updateByQuery({
        index: 'users',
        body: {
            script: {
                source: 'ctx._source.lastSyncTime = params.lastSyncTime',
                params: {
                    lastSyncTime: lastSyncTime
                }
            },
            query: {
                match: { email: email }
            }
        }
    });
};

const updateFetchedEmails = async function (email, fetchedEmails) {
    await client.updateByQuery({
        index: 'users',
        body: {
            script: {
                source: 'ctx._source.fetchedEmails = params.fetchedEmails',
                params: {
                    fetchedEmails: fetchedEmails
                }
            },
            query: {
                match: { email: email }
            }
        }
    });
};

async function getEmailMessageById(messageId) {
    try {
        const result = await client.search({
            index: 'email_messages',
            body: {
                query: {
                    match: {
                        messageId: messageId
                    }
                }
            }
        });

        // Check if 'total' is defined in the response
        // @ts-ignore
        const totalHits = result.hits.total?.value;

        if (totalHits > 0) {
            return result.hits.hits.map(hit => hit._source);
        } else {
            return null; // or an empty array, depending on how you want to handle no results
        }
    } catch (error) {
        console.error('Error fetching email message:', error);
        throw error;
    }
}
module.exports = {
    saveUser,
    saveEmailMessage,
    saveMailbox,
    getUserByEmail,
    bulkSaveEmails,
    updateLastSyncTime,
    updateFetchedEmails,
    getEmailMessageById
};
