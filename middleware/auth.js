const dotenv = require('dotenv')
dotenv.config()

const auth = () => {
  return async function (req, res, next) {
    try {
      const authHeader = req.headers.authorization
      const bearer = 'Bearer '

      if(!authHeader || !authHeader.startsWith(bearer)) {
        res.send({
          response: false,
          message: "Access denied. No credentials sent!",
          data: null
        })
      }

      const token = authHeader.replace(bearer, "")
      const verifyToken = process.env.TOKEN || ""
      
      if( token !== verifyToken ) {
        res.send({
          response: false,
          message: "Authentication Failed!",
          data: null
        })
      }

      next()
    } catch (error) {
      error.status = 500
      next(error)
    }
  }
}

module.exports = auth