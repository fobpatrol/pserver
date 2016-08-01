'use strict';
const express        = require('express');
const cors           = require('cors');
const ParseServer    = require('parse-server').ParseServer;
const expressLayouts = require('express-ejs-layouts');
const path           = require('path');
const FSFilesAdapter = require('parse-server-fs-adapter');
const S3Adapter      = require('parse-server').S3Adapter;

// Parse configuration
const PORT            = process.env.PORT || 1337;
const DATABASE_URI    = process.env.MONGO_URL || process.env.DATABASE_URI || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/dev';
const SERVER_URL      = process.env.SERVER_URL || 'http://localhost:1337/parse';
const APP_ID          = process.env.APP_ID || 'myAppId';
const MASTER_KEY      = process.env.MASTER_KEY || 'myMasterKey';
const MASTER_REST_KEY = process.env.MASTER_REST_KEY || 'myRestApiKey';
const APP_NAME        = process.env.APP_NAME || 'parseApp';
const PARSE_MOUNT     = process.env.PARSE_MOUNT || '/parse';
const CLOUD_CODE_MAIN = process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js';

// Parse Push Android
let PUSH_ANDROID_SENDER  = process.env.PUSH_ANDROID_SENDER;
let PUSH_ANDROID_API_KEY = process.env.PUSH_ANDROID_API_KEY;

// Database Ecosystem file
if (!DATABASE_URI) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

let ServerConfig = {
    databaseURI             : DATABASE_URI,
    cloud                   : CLOUD_CODE_MAIN,
    appId                   : APP_ID,
    masterKey               : MASTER_KEY,
    serverURL               : SERVER_URL,
    restAPIKey              : MASTER_REST_KEY,
    publicServerURL         : SERVER_URL,
    appName                 : APP_NAME,
    verifyUserEmails        : false,
    enableAnonymousUsers    : true,
    allowClientClassCreation: true,
    maxUploadSize           : '10mb',
    liveQuery               : {
        classNames: ['GalleryActivity']
    },
    push: {
      ios:{
         pfx: "$RELATIVE_PATH_TO_YOUR_p12_FILE",
         bundleId: "$RELATIVE_PATH_TO_YOUR_p12_FILE",
         production: false
      },
      android:{
         senderId: "285805785383",
         apiKey: "AIzaSyCBXV7CnhusYV0172lMsvvDy1zHfr96luk"
      }
   }
};


// File Local
const UPLOAD_LOCAL_PATH = process.env.UPLOAD_LOCAL_PATH;
if (UPLOAD_LOCAL_PATH) {
    ServerConfig.filesAdapter = new FSFilesAdapter({
        filesSubDirectory: UPLOAD_LOCAL_PATH
    });
}

// AWS S3 configuration
const AWS_ACCESS_KEY_ID     = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_NAME           = process.env.BUCKET_NAME;
if (AWS_ACCESS_KEY_ID) {
    ServerConfig.filesAdapter = new S3Adapter(
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        BUCKET_NAME,
        {directAccess: true}
    );
}


// Mailgun configuration
const MAILGUN_API_KEY      = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN       = process.env.MAILGUN_DOMAIN;
const MAILGUN_FROM_ADDRESS = process.env.MAILGUN_FROM_ADDRESS;
if (MAILGUN_API_KEY) {
    ServerConfig.emailAdapter = {
        module : 'parse-server-simple-mailgun-adapter',
        options: {
            apiKey     : MAILGUN_API_KEY,
            fromAddress: MAILGUN_DOMAIN,
            domain     : MAILGUN_FROM_ADDRESS,
        }
    };
}

console.log(ServerConfig);

// Start Parse Server
const api = new ParseServer(ServerConfig);
const app = express();

// Cors
app.use(cors());

// EJS Template
app.set('view engine', 'ejs');
app.set('views', 'views');

// Serve the Parse API on the /parse URL prefix
const mountPath = PARSE_MOUNT;
app.use(mountPath, api);

app.use(express.static('views'));
app.use(expressLayouts);

app.use((req, res, next) => {
    res.locals.appId     = APP_ID;
    res.locals.serverUrl = SERVER_URL;
    next();
});

app.get('/', (req, res) => res.render('index'));

const httpServer = require('http').createServer(app);
httpServer.listen(PORT, () => console.log('parse-server-example running on port ' + PORT + '.'));

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);


// Socket.io Server
/*
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', function(socket){
    console.log('a user connected');
});

http.listen(PORT, () => console.log('parse-server-example running on port ' + PORT + '.'));
// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(http);
/*

