const express = require('express')

const router = express.Router()

const nftController = require('../controllers/nft')
const awaitHandlerFactory = require('../middleware/handler');

router.get('/transfer/:mint/:address', awaitHandlerFactory(nftController.transfer))
router.get('/info/:mint/:address', awaitHandlerFactory(nftController.info))

module.exports = router;