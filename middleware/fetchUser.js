const jwt=require('jsonwebtoken'); // jsonwebtoken imported
const JWT_signture='adjfhdjfhdfhdsf';

const fetchUser=(req,res,next)=>{
    //get the user fromt the jwt and add the id to request
    const token=req.header('auth-token');
    if(!token){
         res.status(401).send({error:"please authenticate with valid User"});
    }
    try {
    const data =jwt.verify(token, JWT_signture)
    req.user=data.user;
    next();
    } catch (error) {
      console.log(error.message);
      res.status(401).send({error:"please authenticate with valid User"});
    }
    
}
module.exports=fetchUser;