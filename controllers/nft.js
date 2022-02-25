const NFTService = require('../services/nft')

class NFTController{
  transfer = async(req, res, next) => {
    try {
      const result = await NFTService.transfer( req.params.mint, req.params.address )
      res.send(result)
    } catch(error) {
      next(error)
    }
  }
  info = async(req, res, next) => {
    try {
      const result = await NFTService.info( req.params.mint, req.params.address )
      res.send(result)
    } catch(error) {
      next(error)
    }
  }
}

module.exports = new NFTController