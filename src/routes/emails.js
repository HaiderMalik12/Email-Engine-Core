// @ts-nocheck
const router = require('express-promise-router').default();
const elasticsearchService = require('../services/elasticSearchService');


router.get('/:messageId', async (req, res) => {
    try {
        if (!req.session.userId) {
            // Redirect unauthenticated requests to home page
            res.redirect('/');
        }
        const emailMessage = await elasticsearchService.getEmailMessageById(req.params.messageId);
        return res.status(200).json(emailMessage);
    }
    catch (err) {
        console.error(`Error while fetching email message based on messageId ${err}`);
        req.flash('error_msg', {
            message: 'Could not fetch email',
            debug: JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
    }
});


router.get('/', async (req, res) => {
    try {
        if (!req.session.userId) {
            // Redirect unauthenticated requests to home page
            res.redirect('/');
        }
        const emailMessages = await elasticsearchService.getAllEmailMessages();
        const params = { emailMessages };
        console.log('emailMessages.length', emailMessages.length);
        res.render('emailMessages', params);
    }
    catch (err) {
        console.error(`Error while fetching email message based on messageId ${err}`);
        req.flash('error_msg', {
            message: 'Could not fetch email',
            debug: JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
    }
});
module.exports = router;
