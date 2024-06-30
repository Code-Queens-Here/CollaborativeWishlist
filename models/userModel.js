const mongoose=require('mongoose')
const cartSchema = new mongoose.Schema(
  {
    
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Item",
    },
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
   
  
  },{
    _id:false
  });

const Carts=new mongoose.Schema({
 
  individualCarts:[cartSchema],
  name:{
    type:String,
    required:true,
    default:'Cart'
  },
  sharedWith:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:'User'
    }
  ]
 ,
 cartType:{
  type:String,
  required:true,
  default:'Private'
}


})
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
    Collections:[Carts],
    associatedUsers:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
    }]
  },
  {
    timestamps: true,
  }
);

module.exports=mongoose.model("User", userSchema);
