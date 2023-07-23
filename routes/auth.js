const express=require('express');// express imported
const router=express.Router(); // router imported 
const User=require('../models/User') // User file is imported from models folder
const { body, validationResult } = require('express-validator'); // this is define for validation of express to give constrains of parameters 
const bcrypt = require('bcryptjs'); // For bcrypt imported bcryptjs 
const jwt=require('jsonwebtoken'); // jsonwebtoken imported 
const JWT_signture='adjfhdjfhdfhdsf';
var fetchUser=require('../middleware/fetchUser');


//Endpoint 1) Router1 : "/api/auth/CreateUser" ---> to creater the user with his details. using post request . required no login
router.post('/CreateUser',[
    body('name','Enter the your name: ').isLength({min:3}),
    body('email','Enter the email : ').isEmail(),
    body('password','Enter the password: ').isLength({min:5}),

],async (req,res)=>{
    // given two things 1) respone and 2) request 

    const errors = validationResult(req); // check validation of request
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // if error occur then give this error 
    }

   // this is define to create User in mogoDB and catch error if there is
   try {
    let user=await User.findOne({email:req.body.email});// this is promise so applied await
    if(user){
        return res.status(400).json({error:"this is not valid user"});
    }
    // To Generate hash of password so password make stronger
    const salt = await bcrypt.genSalt(10);
    const secpass=await bcrypt.hash(req.body.password,salt);
    // Create User with name,email and password 
    user= await User.create({
        name: req.body.name,
        email:req.body.email,
        password:secpass,
      });

      const data={
        user:{
            id: User.id
        }
      }
      const authtoken=jwt.sign(data,JWT_signture);
      //console.log(jwt_data);
      res.json(authtoken);
   } catch (error) {
    console.log(error.message);
   }
})

//Endpoint 2) Router2: "/api/auth/login"  ---> to authantication of user using Post request. required login

router.post('/login', [
    body('email', 'Enter the email : ').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let {email,password}=req.body;
      let user = await User.findOne({email});
      if (!user) {
        return res.status(500).json({ error: "Try to login with correct credentials" });
      }
  
      const userpassword = await bcrypt.compare(password, user.password);
      if (!userpassword) {
        return res.status(400).json({ error: "Try to login with correct credentials" });
      }
  
      const data = {
        user: {
          id: user.id,
        }
      };
  
      const authtoken = jwt.sign(data, JWT_signture);

      res.json({ authtoken });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });


//Endpoint 3) Router3: "/api/auth/fetchUser"  ---> to fetchUser using Post request

router.post('/fetchUser',fetchUser, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId=req.user.id;
      const user=await User.findById(userId).select('-password') ;
      res.send(user);
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });


module.exports=router; // router exported