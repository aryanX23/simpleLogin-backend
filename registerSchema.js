const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const userSchema= new Schema({
    user_name: {
        type: String,
        required:true
    },
    user_email: {
        type: String,
        required:true
    },
    password:{
        type: Object,
        required:true
    }
});
module.exports=mongoose.model('register_details',userSchema);