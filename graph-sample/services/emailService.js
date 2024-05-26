const client = require('../config/elasticsearchConfig');

const saveEmails = async (emails, userId) => {
    for (const email of emails) {
        const emailMessage = {
            userId,
            messageId: email.id,
            subject: email.subject,
            body: email.body.content,
            receivedDate: email.receivedDateTime
        };
        await client.index({
            index: 'email_messages',
            body: emailMessage
        });
    }
};

module.exports = {
    saveEmails
};