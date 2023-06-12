const express = require("express")
const cors = require("cors")
const port = process.env.PORT || 1000 
const app = express()
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

 

app.use(express.json())
app.use(cors())

// verify token 
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' });
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })
}

 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.va9oo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const classDatabase = client.db("schoolDB").collection("classes")
    const instructorDatabase = client.db("schoolDB").collection("instructor")
    const booksCollection = client.db("schoolDB").collection("books")
    const userCollection = client.db("schoolDB").collection("user")

      // jwt token 
      app.post('/jwt',(req,res)=>{
        const user = req.body 
        const token = jwt.sign(user,process.env.ACCESS_TOKEN,  { expiresIn: '88h' })
        res.send({token})
      })
        //get the data 
        app.get("/classes",async(req,res)=>{
          const result = await classDatabase.find().toArray()
          res.send(result)
        })

        //user related ipi the data 
        app.get("/instructor",async(req,res)=>{
          const result = await instructorDatabase.find().toArray()
          res.send(result)
        })

        app.get("/users",  async(req,res)=>{
          const result = await userCollection.find().toArray()
          res.send(result)
        })

        app.post("/users",async(req,res)=>{
          const user = req.body
          console.log(user)
          const query = {email: user.email}
          const existingUser = await userCollection.findOne(query)
          console.log('existing user',existingUser)
          if(existingUser){
            return res.send({message:'user already exits'})
          }
          const result = await userCollection.insertOne(user)
          res.send(result)
        })

            app.patch('/users/admin/:id', async (req, res) => {
              const id = req.params.id;
              console.log(id);
              const filter = { _id: new ObjectId(id) };
              const updateDoc = {
                $set: {
                  role: 'admin'
                },
              };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);

    })

        
    
      // book collection 

        app.get("/books",verifyJWT, async(req,res)=>{
          const email = req.query.email
         
          if(!email){
             return res.send([])
          } 
          const decodedEmail = req.decoded.email;
          if (email !== decodedEmail) {
            return res.status(403).send({ error: true, message: 'forbidden access' })
          }
            const query = {email:email}
           const result = await booksCollection.find(query).toArray()
         return res.send(result)
        })

        app.post("/books",async(req,res) =>{
          const item = req.body 
          const result = await booksCollection.insertOne(item)
          res.send(result)
        })
       
         app.delete('/books/:id', async (req, res) => {
          const id = req.params.id;
           console.log(id)
          const query = { _id: new ObjectId(id) };
          const result = await booksCollection.deleteOne(query);
          console.log(result)
          res.send(result);
    })
  
     
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/",async(req,res)=>{
  res.send("Language School server is running")
})

app.listen(port,()=>{
  console.log(`Language School server is running on ${port}`)
})
