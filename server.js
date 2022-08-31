const express= require('express');
const bodyParser= require('body-parser');
const cors=require('cors');
const app=express();
const session=require('express-session');
const cookieParser=require('cookie-parser');
const mongoose=require('mongoose');
const {encrypt,decrypt,secretKey} =require('./crypto');
const MongoDBStore=require('connect-mongodb-session')(session);
const MONGO_URI="mongodb://localhost:27017/simpleLoginDB";
const store=new MongoDBStore({
    uri: MONGO_URI,
    collections: 'sessions'
});
const User_details=require('./registerSchema');
//<---------------------------------IMPORTING PACKAGES----------------------------------------->

//<---------------------------------START OF MIDDLEWARE---------------------------------------->
app.use(bodyParser.json());
app.use(cors({
    origin:"http://localhost:3000",
    credentials: true
}));
app.use(cookieParser());
app.use(
    session({
      secret: secretKey,
      resave: true,
      saveUninitialized: false,
      cookie: {
        expires: 60000*30,
        secure:false
    },
        store:store
    })
);
//<---------------------------------END OF MIDDLEWARE------------------------------------------>


app.get('/',(req,res)=>{

});
app.post('/register',(req,res)=>{
    const {name,email,password}=req.body;
    const user=new User_details({
        user_name:name,
        user_email:email,
        password:encrypt(password)
    });
    user.save().then(result=>{
        console.log("Created Entry");
        res.json("User Registered Successfully!");
    }).catch((err)=>{
        res.json("Internal error!");
    });
});
app.post('/signin',(req,res)=>{
    console.log("signin");
    const {email,password}=req.body;
    const query = User_details.findOne({ 'user_email': email });
        query.select('password');
        query.exec(function (err, user) {
        if (user === null){
            res.status(400).json("Invalid User!");
        }
        else
        {
            if(decrypt(user.password).localeCompare(password)===0){
                req.session.isLoggedIn=true;
                User_details.findOne({ 'user_email': email }, 'user_name', function (err, user) {
                    if (err) return handleError(err);
                    req.session.name=user.user_name;
                  });
                res.status(200).json("Success!");
            }
            else{
                res.status(400).json("Wrong Password!");
            }
        }
    });
});
app.get('/login',(req,res)=>{
    console.log("/login");
    if(req.session.isLoggedIn)
        res.json({name:req.session.name,isLoggedIn:req.session.isLoggedIn});
    else
        res.send({isLoggedIn:false});
});
app.get('/logout',(req,res)=>{
    console.log("/logout");
    req.session.destroy(err=>{
        console.log(err);
    });
    res.send("User Logged Out Successfully!");
});

mongoose.connect(MONGO_URI).then(result=>{
    app.listen(5000,()=>{
        console.log("Server is successfully running on port 5000");
    });
}).catch(console.log);