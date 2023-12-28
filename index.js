import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import  jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
mongoose.connect('mongodb://localhost:27017',{
    dbName: 'backend',
}).then(c=> console.log("database connected")).catch(e=>console.log('error'))
const usereSchema  = new mongoose.Schema({
    name: String,
    email : String,
    password : String
})
const User = mongoose.model("user",usereSchema)
// using middle ware
app.use(express.static(path.join(path.resolve(),"public")));
app.use(express.urlencoded({extended : true}))
app.use(cookieParser());
const isAuthenticated = async(req,res,next)=>{
    const {token} = req.cookies;
    if (token){
      const DecodedData=jwt.verify(token , "zazazazaazza" );
      req.user =  await User.findById(DecodedData._id);
      next();
    }
    else{
      res.redirect('/login')

    }
}
app.set("view engine","ejs");
 ////  POST METHODS

app.post('/',(req, res)=>{
  
})
 app.post('/register',async(req , res)=>{
    const {name , email , password} = req.body ;
         let user = await User.findOne({email})
         if(user){
            return res.redirect("/login")
         }
         const hashedPass = await bcrypt.hash(password , 10);
      user = await User.create ({
        name , 
        email,
        password:hashedPass,
    })
     const token  = jwt.sign({ _id : user._id}, "zazazazaazza");
      res.cookie("token",token)
      res.redirect('/')
 })
  app.post('/login',async(req , res)=>{
  const {email  , password}= req.body;

  let user = await User.findOne({email});
  if(!user) {
    return res.redirect("/register");
  }

  const isMatch = await bcrypt.compare(password ,user.password) ; 
  if(!isMatch){
    return res.render("login",{email ,message : "incorrect password"});
  }
  const token  = jwt.sign({ _id : user._id}, "zazazazaazza");
  res.cookie("token",token)
  res.redirect('/')
  })
////  GEET METHODS
 app.get('/',isAuthenticated,(req,res)=>{
    
    res.render("logout", {name : req.user.name});
 
 })
 app.get('/register',(req,res)=>{
     res.render("register");
  
  })


app.get('/login',(req,res)=>{
    res.render("login")
})

 app.get('/logout',(req,res)=>{
    res.cookie("token", null, { expires: new Date(0) }); 
    res.redirect('/');
 })

  


app.listen(5000, ()=>{
    console.log("server is working........");
})