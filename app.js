const express = require('express');
const fs = require('fs')
const app = express();
const session = require('express-session')
const router = require('./routes/products')
const routerTest = require('./routes/products-test')
const routerRandom = require('./routes/random')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
require('dotenv').config()
var bcrypt = require('bcryptjs');
let Schema = mongoose.Schema;



const {Server: IOServer} = require('socket.io')
const {Server: HttpServer} = require('http')
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)
const advanceOptions = {useNewUrlParser:true, useUnifiedTopology:true}

const port = 8080

const schema = new mongoose.Schema({ user: 'string', password: 'string' });    
const Users = mongoose.model('users', schema);

//password encryption
const saltRounds = 10;

passport.use(new LocalStrategy(
    async function(username,password,done){        
        Users.findOne({user:username},function(err,user){
            if (err){
                return done(err)
            }
            if (!user){
                console.log('Usuario no registrado passport')
                return done(null,false)
            }
            if (!bcrypt.compareSync(password, user.password)){                
                console.log('Credenciales incorrectas passport')
                return done(null,false)
            }
            else{
                return done(null,user)
            }
            
        })
    }
))

passport.serializeUser((user,done)=>{
    done(null, user.user)
})

passport.deserializeUser(async (username,done)=>{
    const usuario = await Users.findOne({user:username})   
    done(null, usuario)
})



app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use('/api/products',router)
app.use('/api/products-test',routerTest)
app.use('/api',routerRandom)
app.use(cookieParser())
app.use(express.static('./public'))
app.use(session({
    store: MongoStore.create({
        mongoUrl:process.env.MONGO_URL,
        mongoOptions: advanceOptions
    }),
    secret:process.env.SECRET_SESSION,
    resave:true,
    saveUninitialized:true,
    cookie:{
        maxAge:60000
    }
}))

app.use(passport.initialize())
app.use(passport.session())


app.engine('html', require('ejs').renderFile)
app.set('view engine', 'ejs')


app.post('/login',passport.authenticate('local',{successRedirect:'/login',failureRedirect:'/login-error'}))

// app.post('/login',async (req,res)=>{
//     try {        
//         const usuario = await Users.findOne({user:req.body.user})        
//         if(usuario){            
//             if(usuario.password != req.body.password){
//                 console.log('Credenciales incorrectas')
//                 res.send('Credenciales incorrectas')
//             }
//             else{
//                 req.session.name = req.body.user
//                 req.session.password = req.body.password
//                 res.render('login.html')
//             }        
//         }
//         else{
//             res.send('Usuario no registrado')
//         }        
//     } catch (error) {
//         console.log(error)        
//     }    
    
// })

app.get('/login',(req,res)=>{    
    res.render('login.html')
})

app.get('/register',(req,res)=>{    
    res.render('register.html')
})

app.post('/register', async (req,res)=>{
    try {        
        const usuario = await Users.findOne({user:req.body.user})    
        if(usuario){
            res.send(`Usuario ya registrado`)
        }
        else{
            const passwordPlain = req.body.password;
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(passwordPlain, salt);
            const newUser = await new Users({user:req.body.user,password:hash})
            const dataSave = await newUser.save()
            res.redirect('/')
    }        
    } catch (error) {
        console.log(error)        
    }    
    
})

app.get('/login-info',async (req,res)=>{    
    if(req.session.passport != undefined){
        res.json({user:req.session.passport.user})
    }
    else{
        res.send('Error')
    }     
    
})

app.get('/login-error',(req,res)=>{
    res.send('Login error')
})

app.get('/logout',(req,res)=>{
    req.session.destroy(err=>{
        if(!err){
            res.render('logout.html')
        }
        else{
            res.send('Error logout')
        }
    })
})

app.get('/info',(req,res)=>{
    let resObject = [process.argv,
                process.platform,
                process.version,
                process.memoryUsage().rss,
                process.argv[0],
                process.pid,
                process.cwd(),                              
                ]  

    res.send(resObject)
})


httpServer.listen(port,console.log(`Listening on port ${port}`))


const getAllMensajes = async () => {
    try {
        let file = await fs.promises.readFile('./files/mensajes.txt')
        file = new Array(file)
        return JSON.parse(file)    
    } catch (error) {
        console.log(error)
    }    
}

const createMensaje = async (mensaje) => {      
    try {
        let file = await fs.promises.readFile('./files/mensajes.txt','utf-8')
        file = JSON.parse(file)        
        file.push(mensaje)
        await fs.promises.writeFile('./files/mensajes.txt',JSON.stringify(file,null,2))
        return file              
    } catch (error) {
        console.log(error)
    }  
}

let messages = getAllMensajes()


app.get('/products',(req,res) => {    
    res.render('products.html')
})


io.on('connection', async (socket) => {
    console.log('Usuario conectado')
    socket.emit('render','')    
    socket.emit('messages',await messages.then(data => {return data}))       
    socket.on("productAdded", (data) => {
        console.log("Recibi producto agregado")        
        io.sockets.emit('newProduct','Nuevo producto agregado')
    });
    socket.on('new-message', async data => {        
        messages = createMensaje(data)
        io.sockets.emit('messages',await messages.then(data => {return data}))
    });
})




function connectMongoDB(){
    mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology:true
    })
    console.log('Base de datos conectada')    
    let Schema = mongoose.Schema
    let User = mongoose.model('User', new Schema({}),'users')
    User.find({},function(err,doc){
        console.log(doc)
    })   
    
}

connectMongoDB()


