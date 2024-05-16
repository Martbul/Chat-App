const express = require("express")
const cors = require("cors")

const app = express()
const port = 5000

app.use(express.json())
app.use(cors())

app.listen(port,(req,res) =>{
    console.log(`Server is running on port: ${port}`);
})