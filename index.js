const express = require("express")
const cors = require("cors")
const port = process.env.PORT || 1000 
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

 

app.use(express.json())
app.use(cors())


app.get("/",async(req,res)=>{
  res.send("Language School server is running")
})

app.listen(port,()=>{
  console.log(`Language School server is running on ${port}`)
})
