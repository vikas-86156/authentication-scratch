const express=require('express');
const app=express();
const mongoose=require('mongoose');
const User=require('./models/user');
const path=require('path');
const bcrypt=require('bcrypt');
const session =require('express-session');

mongoose.set('strictQuery',false)
mongoose.connect('mongodb://127.0.0.1:27017/authdemo',{
    useNewUrlParser:true,
    // useCreateIndex:true,
    useUnifiedTopology:true,
})
.then(()=>{
    console.log("connection open ...")

})
.catch((err)=>{
    console.log(err)
    console.log("error")
})

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({ extended: true }));
app.use(session({secret:'notagoodsecret'}));

const requireLogin=(req,res,next)=>{
    if(!req.session.user_id)
    {
        res.redirect('/login')
    }
    else{
    next();}
}

app.get('/',(req,res)=>{
    res.send("this is homepage ...");
})

app.get('/register',(req,res)=>{
    res.render('register');
})

app.post('/register',async (req,res)=>{
    const {username ,password}=req.body;
    const hashedpw=await bcrypt.hash(password,12);
    const user= await new User({username:username,password:hashedpw});
    await user.save();
    req.session.user_id=user._id;
    res.redirect('/');

})

app.get('/login',(req,res)=>{
    res.render('login');
})

app.post('/login',async(req,res)=>{
    const user= await User.findOne({username:req.body.username});
   
    if(user)
    {
        const result=await bcrypt.compare(req.body.password,user.password);
            if(result)
            {
                req.session.user_id=user._id;
                res.redirect('/');
            }
            else{
            res.redirect('/login');
            }
    }
    else{
        res.redirect('/login');
    }
})

app.get('/logout',(req,res)=>{
    res.render('logout');
})
app.post('/logout',(req,res)=>{
    req.session.user_id=null;
    res.redirect('/login');
})

app.get('/secret',requireLogin,async(req,res)=>{
    res.send("you r logeed in ");

})


app.listen(3000,()=>{
    console.log("serving up port 3000 ...")
})