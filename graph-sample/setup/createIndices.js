const client = require('../config/elasticsearchConfig');

async function createIndices() {
    await client.indices.create({
        index: 'users',
        body: {
            mappings: {
                properties: {
                    email: { type: 'keyword' },
                    localId: { type: 'keyword' },
                    accessToken: { type: 'text' },
                    refreshToken: { type: 'text' }
                }
            }
        }
    });

    await client.indices.create({
        index: 'email_messages',
        body: {
            mappings: {
                properties: {
                    userId: { type: 'keyword' },
                    messageId: { type: 'keyword' },
                    subject: { type: 'text' },
                    body: { type: 'text' },
                    receivedDate: { type: 'date' }
                }
            }
        }
    });

    await client.indices.create({
        index: 'mailboxes',
        body: {
            mappings: {
                properties: {
                    userId: { type: 'keyword' },
                    mailboxId: { type: 'keyword' },
                    name: { type: 'text' },
                    type: { type: 'keyword' }
                }
            }
        }
    });
}

createIndices().catch(console.log);
