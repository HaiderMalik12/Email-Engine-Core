// @ts-nocheck
const router = require('express-promise-router').default();
const elasticsearchService = require('../services/elasticSearchService');


router.get('/:messageId', async (req, res) => {
    try {
        const emailMessage = await elasticsearchService.getEmailMessageById(req.params.messageId);
        return res.status(200).json(emailMessage);
    }
    catch (err) {
        console.error(`Error while fetching email message based on messageId ${err}`)
    }
});

module.exports = router;
