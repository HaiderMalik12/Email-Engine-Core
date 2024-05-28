const express = require('express');
const router = express.Router();
const elasticsearchService = require('../services/elasticSearchService');
// const graph = require('../graph');

router.post('/', async (req, res) => {
    try {
        const validationToken = req.query.validationToken;
        if (validationToken) {
            console.log(`Received validation token: ${validationToken}`);
            res.status(200).send(validationToken);
            return;
        }

        const notifications = req.body.value;
        for (const notification of notifications) {
            const { resource, changeType, clientState } = notification;
            const userId = clientState; // Extract the user ID from clientState
            console.log(`Processing notification for user ID: ${userId}`); // Log the user ID

            if (!userId) {
                console.error('User ID is missing in the notification.');
                continue; // Skip processing if user ID is missing
            }

            if (changeType === 'deleted') {
                // Extract the message ID from the resource URL
                const messageId = resource.split('/').pop();
                console.log(`Deleting email with ID: ${messageId}`);
                await elasticsearchService.deleteEmailById(messageId);
            }
            // TODO: Need to handle three more cases if user read the email, moved email to different folder
            // else {
            //     const client = graph.getAuthenticatedClient(req.app.locals.msalClient, userId);
            //     const message = await client.api(resource).get();

            //     await elasticsearchService.saveEmailMessage({
            //         userId: userId,
            //         messageId: message.id,
            //         subject: message.subject,
            //         body: message.bodyPreview,
            //         receivedDate: message.receivedDateTime
            //     });
            // }
        }
        res.status(202).send();
    } catch (err) {
        console.error(`Error while receiving the notification from Microsoft Graph API: ${err}`);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
