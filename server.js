var express = require('express')
var fs = require('fs');
var socketEvents = require('./sockets.js')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var aws = require('./aws');
var cors = require('cors');
const socketioAuth = require("socketio-auth")
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
require('dotenv').config(); // Loading dotenv to have access to env variables

// Connect to the Database
const mongoose = require("mongoose")
mongoose.Promise = require("bluebird")
const mongoOpts = {
  useNewUrlParser: true,
  keepAlive: 1, connectTimeoutMS: 30000,
}
const mongoUrl = process.env.DATABASE
mongoose
  .connect(mongoUrl, mongoOpts)
  .catch(e => console.log(e))

app.use((req, res, next) => {
  // console.log(req)
  next()
})

app.use(express.json());
app.use(cors());

// GET URL
app.get('/generate-get-url', (req, res) => {
  // Both Key and ContentType are defined in the client side.
  // Key refers to the remote name of the file.
  const { Key } = req.query;
  aws.generateGetUrl(Key)
    .then(url => {
      res.send(url);
    })
    .catch(err => {
      res.send(err);
    });
});

// PUT URL
app.get('/generate-put-url', (req,res)=>{
  // Both Key and ContentType are defined in the client side.
  // Key refers to the remote name of the file.
  // ContentType refers to the MIME content type, in this case image/jpeg
  const { Key, ContentType } =  req.query;
  aws.generatePutUrl(Key, ContentType).then(url => {
    res.send({url});
  })
  .catch(err => {
    res.send(err);
  });
});


app.get('/game', (req,res)=>{
  const { gameId } =  req.query;
  fs.readFile('data/game/' +gameId+'.json', 'utf8', function readFileCallback(err, data){
    if (err){
      res.send(err);
    } else {
      let game = JSON.parse(data);
      res.send({game})
    }
  });
});

function getSpriteSheet(id, cb) {
  fs.readFile('./data/sprite/' +id+'.json', 'utf8', function readFileCallback(err, data){
    if (err){
        console.log(err);
    } else {
    let spritesheet = JSON.parse(data); //now it an spritesheetect
    return cb(spritesheet)
  }});
}
app.get('/spriteSheets', (req,res)=>{
  const { spriteSheetIds } =  req.query;

  const sss = []
  spriteSheetIds.forEach((id) => {
    getSpriteSheet(id, (spriteSheet) => {
      sss.push(spriteSheet)
    })
  })
  res.send({spriteSheets: sss})
})

app.use(express.static(__dirname + '/dist'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/dist/index.html')
})

server.listen(process.env.PORT || 4000, function(){
  console.log('listening on *:' + (process.env.PORT || 4000));
});


// Authenticate!
const User = require("./db/User")
const authenticate = async (socket, data, callback) => {
  const { email, password, signup } = data

  try {
    // session
    if (socket.handshake.headers.cookie){
      const cookieUser = cookie.parse(socket.handshake.headers.cookie).user
      if (cookieUser) {
        const email = jwt.decode(cookieUser, process.env.JWT_KEY)
        if(email){
          const user = await User.findOne({ email })
          if (!user) {
            socket.emit('auth_message', { message: 'No such email and password combination'})
          } else {
            socket.user = user
            return callback(null, !!user)
          }
        }
      }
    }

    // // sign up
    // if (signup) {
    //   const user = await User.create({ email, password })
    //   socket.user = user
    //   return callback(null, !!user)
    // }

    // login
    const user = await User.findOne({ email })
    if (!user) {
      socket.emit('auth_message', { message: 'No such email and password combination'})
      return
    }
    if(user.validPassword(password)) {
      socket.user = user
      return callback(null, user)
    }

    // error handling
    socket.emit('auth_message',  { message: 'No such email and password combination'})
  } catch (error) {
    socket.emit('auth_message', { message: 'Authentication error. Email probably already exists'})
    console.log(error)
    callback(error)
  }
}

const postAuthenticate = socket => {
  socket.emit('authenticated', {cookie: jwt.sign(socket.user.email, process.env.JWT_KEY), user: socket.user})
  socketEvents(fs, io, socket)
}

// Configure Authentication
socketioAuth(io, { authenticate, postAuthenticate, timeout: "none" })
