"use strict"
const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')
//const bodyParser = require('body-parser')  已棄用
const fs = require('fs')
// const events = require('./db/events.json')
const https = require('https')

//  MongoDB 設置
const db = require("./app/models/");
const serveStatic = require('serve-static')
const Role = db.role;


// SSL 認證
// var key = fs.readFileSync('./private.key');
// var cert = fs.readFileSync('./certificate.crt');
// var credentials = {
//     key: key,
//   	cert: cert,
// };

// MongoDB 
db.mongoose.connect(`mongodb+srv://andy:andy1234@cluster0.f0qad.gcp.mongodb.net/AnimeUser?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connect to MongoDB")
  initial();
}).catch(err => {
  console.error("Connection error", err)
  process.exit()
})

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }
        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}

const app = express()
const corsOptions = {
  origin: ['https://aylu.tw', 'https://www.aylu.tw','https://testanime.aylu.tw','https://anime.aylu.tw','http://192.168.0.149'],
}

app.use(cors(corsOptions))
// app.use(bodyParser.json());  已棄用  下面取代  包含在express裡
app.use(express.json())
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the API.'
  })
})

// app.get('/dashboard', verifyToken, (req, res) => {
//   jwt.verify(req.token, 'the_secret_key', err => {
//     if (err) {
//       res.sendStatus(401)
//     } else {
//       res.json({ events: events })
//     }
//   })
// })

// app.post('/register', (req, res) => {
//   if (req.body) {
//     const user = {
//       name: req.body.name,
//       email: req.body.email,
//       password: req.body.password
//       // In a production app, you'll want to encrypt the password
//     }

//     const data = JSON.stringify(user, null, 2)
//     var dbUserEmail = require('./db/user.json').email

//     var errorsToSend = []

//     if (dbUserEmail === user.email) {
//       errorsToSend.push('An account with this email already exists !')
//     }

//     if (user.password.length < 5) {
//       errorsToSend.push('Passoword must longer than 5 digits')
//     }

//     if (errorsToSend.length > 0) {
//       res.status(400).json({ errors: errorsToSend })
//     } else {
//       fs.writeFile('./db/user.json', data, err => {
//         if (err) {
//           console.log(err + data)
//         } else {
//           const token = jwt.sign({ user }, 'the_secret_key')
//           // In a production app, you'll want the secret key to be an environment variable
//           res.json({
//             token,
//             email: user.email,
//             name: user.name
//           })
//         }
//       })
//     }
//   } else {
//     res.sendStatus(400)
//   }
// })

// app.post('/login', (req, res) => {
//   const userDB = fs.readFileSync('./db/user.json')

//   const userInfo = JSON.parse(userDB)
//   if (
//     req.body &&
//     req.body.email === userInfo.email &&
//     req.body.password === userInfo.password
//   ) {
//     const token = jwt.sign({ userInfo }, 'the_secret_key')
//     // In a production app, you'll want the secret key to be an environment variable
//     res.json({
//       token,
//       email: userInfo.email,
//       name: userInfo.name
//     })
//   } else {
//     res.status(401).json({error:'Invalid Login'})
//   }
// })

// MIDDLEWARE
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization']

  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]
    req.token = bearerToken
    next()
  } else {
    res.sendStatus(401)
  }
}
// const httpsServer = https.createServer(credentials,app)
// httpsServer.listen(3000,()=>{
//   console.log('start at ' + 3000)
// })
app.listen(3000, () => {
  console.log('Server started on port 3000')
})
