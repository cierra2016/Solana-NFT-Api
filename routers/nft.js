const express = require('express')

const router = express.Router()
const auth = require('../middleware/auth')
const nftController = require('../controllers/nft')
const awaitHandlerFactory = require('../middleware/handler');

router.get('/transfer/:mint/:address', auth(), awaitHandlerFactory(nftController.transfer))
router.get('/info/:mint/:address', auth(), awaitHandlerFactory(nftController.info))

module.exports = router;