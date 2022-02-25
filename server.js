const express = require("express")
const nftRouter = require('./routers/nft')
const app = express()

app.use((req, res, next) => {
  console.log("Request type: ", req.method)
  next()
})

app.use('/api/nft/', nftRouter)

app.get('/', (req, res) => {
  res.send("Successful response")
})

app.listen(3000, () => console.log("Example app is listening on port 3000."))