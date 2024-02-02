const express= require('express') 
 const cors=require('cors')
const { MongoClient, ObjectId } = require('mongodb')
const { Schema, Model, default: mongoose } = require('mongoose')
const app= express()
app.use(express.json())
app.use(cors())
const PORT = process.env.PORT || 5050
let userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    EMailAddress:{
        type:String,
        required:true
    },
    bio:{
        type:String,
        required:true
    },
    passWord:{
        type:String,
        required:true
    }
    ,
    profilePhotoUrl:{
        type:String,
        required:true
    },
    joinedON:{
        type:String,
        default:new Date().toLocaleDateString().split("T")[0]
    }
})
let messageSchema = new Schema({
    text:{
        type:String,
        default:""
    },
    mediaType:{
        type:String,
        default:""
    }
    ,
    mediaUrl:{
        type:String,
        default:""
    },
    senderId:{
        type:String,
        required:true
    },
    receiverId:{
        type:String,
        required:true
    },
    addedON:{
        type:String,
        default:new Date().toLocaleString()
    } 
})
app.post("/createaccount",async(req,res)=>{
 await mongoose.connect("mongodb://127.0.0.1:27017/Chatty")
    const User = mongoose.model("users", userSchema)
    let alreadyRegistered=false

    try {
    let users=  await User.find({})
    if(users.length>0)
    {

    
    for(let user of users)
    {
        if(user.name==req.body.name)
        {
            alreadyRegistered=true
        }
    }
}
else
{
    let user = new User(req.body)
    await user.save()
    res.json({success:true,user})
}
    if(alreadyRegistered)
    {
        res.json({success:false,message:"AlreadyRegistered"})
    }
    else
    {

        let user = new User(req.body)
        await user.save()
        res.json({ success: true, user })
    }
}
    catch (error) {
        res.json({ success: false ,message:"Failed!"})
    }    
})
app.get("/getuser/:UID",async(req,res)=>{
let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("Chatty")
    let _UID = new ObjectId(req.params.UID)
    try
    {
   let user= await dB.collection("users").findOne({_id:_UID})
   res.json({success:true,user})
    }
    catch(e)
    {
    res.json({success:false})
    }
})
app.get("/getusers",async(req,res)=>{
    let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("Chatty")
    try
    {
        let users = await dB.collection("users").find().toArray()
        res.json({success:true,users})

    }
    catch(e)
    {
        res.json({success:false})

    }
})
app.put("/editprofile/:UID",async (req,res)=>{

})
app.post("/login",async(req,res)=>{
 let mongoClient = await MongoClient.connect("mongodb://127.0.0.1:27017")
    let dB = mongoClient.db("Chatty")
    let isRegistered=false
    console.log(req.body.EMailAddress)
    console.log(req.body.passWord)
    try
    {
       let users= await dB.collection("users").find().toArray()
       console.log(users)
        for (let user of users)
        {
            if(user.EMailAddress==req.body.EMailAddress)
            {
                isRegistered=true

            }
        }
       
       if(isRegistered)
       {
       let user= await dB.collection("users").findOne({EMailAddress:req.body.EMailAddress})
       console.log(user)
       if(user.EMailAddress==req.body.EMailAddress&&user.passWord==req.body.passWord)
       {
       res.json({success:true,user})
       }
       else
       {
        res.json({success:false,message:"Incorrect Password"})
       }
       }
       else
       {
        res.json({success:false,message:"NotRegistered"})
       }
    }  
    catch(e)
{
    res.json({success:false,message:"Failed"})

}
})

app.post("/addmessage/:senderId/:receiverId",async(req,res)=>{
    await mongoose.connect("mongodb://127.0.0.1:27017/Chatty")
    let Message = mongoose.model("messages",messageSchema)
  try
  {
    if(req.body.text.length>0)
    {
     let message= new Message({text:req.body.text,senderId:req.params.senderId,receiverId:req.params.receiverId,addedON:new Date().toLocaleString()})
     await message.save()
    res.json({success:true})
    }
  else if(req.body.mediaUrl.length>0)
     {
        console.log("Adding Message With Media")
         let message = new Message({mediaUrl:req.body.mediaUrl,mediaType:req.body.mediaType,senderId:req.params.senderId,receiverId:req.params.receiverId,addedON:new Date().toLocaleString()})
         await message.save()
     res.json({success:true})
     }
     else
     {
     res.json({success:false})
     }
    

  }
  catch(e)
  {
    res.json({success:false})

  }
})
app.delete("/deletemessage/:messageId",async(req,res)=>{
  let mongoClient=await MongoClient.connect("mongodb://127.0.0.1:27017")
  let dB=  mongoClient.db("Chatty")
  let _messageId= new ObjectId(req.params.messageId)
  try
  {
   await dB.collection("messages").deleteOne({_id:_messageId})
   res.json({success:true})
  }
  catch(e)
  {
  res.json({success:false})
  }
})
app.delete("/deletechat/:senderId/:receiverId",async(req,res)=>{
        let mongoClient=await MongoClient.connect("mongodb://127.0.0.1:27017")
      let dB=  mongoClient.db("Chatty") 
})
app.get("/getmessages/:senderId/:receiverId",async(req,res)=>{
    let mongoClient=await MongoClient.connect("mongodb://127.0.0.1:27017")
  let dB=  mongoClient.db("Chatty")
 let messages = [] 
  try
  {
  let allMessages=await dB.collection("messages").find().toArray()
  if(allMessages.length>0)
  {

  for(let message of allMessages)
  {
    if((message.senderId==req.params.senderId||message.senderId==req.params.receiverId)&&(message.receiverId==req.params.senderId||message.receiverId==req.params.receiverId))
    {
        console.log(message)
        messages.push(message)
    }
  }
  res.json({success:true,messages})
}
  }
  catch(e)
  {
    res.json({success:false})
  }
})
startServer = async () => {
    try {
        app.listen(PORT, () => {
            console.log("Listening ON" + PORT)
        })

    }
    catch (error) {
          console.log(error)
    }
}
startServer()
console.log("Done!")
