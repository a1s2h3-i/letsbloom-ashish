const mongoose=require('mongoose');
const { Schema } = mongoose;


const bookSchema = new Schema({
   user:{
      type: mongoose.Schema.Types.ObjectId,
      ref:'User'
   },
   name:{
    type:String,
    required: true,
   },
   authorname:{
    type:String,
    required:true,
   },
   version:{
    type: String,
    required:true,
   },
   category:{
    type : String,
    required: true,
   },
   prize:{
      type:String,
      required:true,
   },
   date:{
    type:Date,
    default:Date.now
   }
  });
  module.exports=mongoose.model('book',bookSchema);