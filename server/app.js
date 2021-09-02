var express = require('express')
var app = express()
var path = require('path')
require('dotenv').config()

// server
var port = parseInt(process.env.PORT)
var httpServer = require('http').createServer(app)

// log requests
var morgan = require('morgan')
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

// core
if(process.env.NODE_ENV === 'development') {
	var cors = require('cors')
	var corsOptions = {
		origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
		credentials: true
	}
	app.use(cors(corsOptions))
}

// database
var mongoose = require('mongoose')
var mongoConnection = 'mongodb://' + ((process.env.DB_USER && process.env.DB_USER !== '') ? (process.env.DB_USER + ':' + process.env.DB_PASSWORD + '@') : '') + process.env.DB_HOST + '/' + process.env.DB_NAME + '?authSource=admin'
if(process.env.DB_CONNECTION_STRING && process.env.DB_CONNECTION_STRING !== '') {
	mongoConnection = process.env.DB_CONNECTION_STRING
}
var mongoOptions = {
	useNewUrlParser: true, 
	useUnifiedTopology: true
}
mongoose.connect(mongoConnection, mongoOptions)
mongoose.set('useCreateIndex', true)

// session
const MongoStore = require('connect-mongo')
var session = require('express-session')
var sessionMiddleware = session({
	store: MongoStore.create({
		mongoUrl: mongoConnection,
		mongoOptions: mongoOptions,
		crypto: {
			secret: process.env.SESSION_SECRET
		}
	}),
	secret: process.env.SESSION_SECRET,
	resave: true,
	saveUninitialized: true,
	cookie: {
		httpOnly: true,
		sameSite: 'strict'
	},
})
app.use(sessionMiddleware)

// tools
var cookieParser = require('cookie-parser')
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// auth
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy
var User = require('./models/user')

passport.use(new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
}, User.authenticate))
passport.serializeUser(User.serializeUser)
passport.deserializeUser(User.deserializeUser)

var passportInitialize = passport.initialize()
var passportSession = passport.session()
app.use(passportInitialize)
app.use(passportSession)

// socket-io chat setup
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next)
var io = require('socket.io')(httpServer, {
	path: '/api/room/chat',
	cors: corsOptions
})
// session support, user found at -> socket.request.user
io.use(wrap(sessionMiddleware))
io.use(wrap(passportInitialize))
io.use(wrap(passportSession))
// routes
require('./controllers/room').chat(io)

// swagger
var swaggerUi = require('swagger-ui-express')
var swaggerDocument = require('yamljs').load('./swagger.yml')
// for more info visit: https://swagger.io/docs/specification/basic-structure/
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// routes
var apiRouter = require('./routes/index')
app.use('/api', apiRouter)

// 404 Page Not Found
const {StatusCodes} = require('http-status-codes')
app.get('/api/404', (req, res, next) => {
	return res.sendStatus(StatusCodes.NOT_FOUND)
})

// react app
if(process.env.NODE_ENV !== 'development') {
	app.use('/*', (req, res, next) => {
		return res.sendFile(path.join(__dirname, 'public/index.html'))
	})
}

httpServer.listen(port, function () {
	console.log('Listening on port %s', port)
})
