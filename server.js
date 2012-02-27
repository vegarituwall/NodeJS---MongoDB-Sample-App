/**
* Rituwall Node.js and Mongodb Storage
* 
*/

require('coffee-script');
require('underscore.logger');

console.log('');
console.log('Starting node server with mongodb. OK.');
console.log('======================================');

console.log('Exec dir: ' + __dirname);

// Log
console.log("Loaded: server.js");

// Create Namespace
if ( typeof(RwNodeStorage) === undefined )
    RwNodeStorage = {};


// Mongo DB
//
global.express     =  require('express');
global.mongodb     =  require('mongodb');
global.server      =  new mongodb.Server("*****.mongolab.com", 27757, { });
global.dbName      =  'heroku_app*******';
global.dbUserName  =  '*****';
global.dbUserPass  =  '*****';

global.app = require('express').createServer();


// Index.html - Base File
//
global.LocalIndex1 = './views/wall-index1-local.html';
global.LocalIndex2 = './views/wall-index2-local.html';

global.CdnIndex1   = './views/wall-index1-cdn.html';
global.CdnIndex2   = './views/wall-index2-cdn.html';

// use = local or cdn
global.useFile     = 'cdn';

if ( useFile == 'local' ) {
  global.indexFile1  = LocalIndex1;
  global.indexFile2  = LocalIndex2;
}

if ( useFile == 'cdn' ) {
  global.indexFile1  = CdnIndex1;
  global.indexFile2  = CdnIndex2;
}



// DB Conenction
//
new mongodb.Db(dbName, server, {}).open(function (error, client) { 
  client.authenticate(dbUserName, dbUserPass, function(err) {
    if (err) console.log('Db conenction error.');
    console.log('DB Connection READY.');
    global.mongoClient = client; 
  });
});


var rituwallOfficial = '/Users/javiervega/Desktop/Development Projects/rituwall-official/rituwall/public';


app.use(express.static(rituwallOfficial));
app.use(express.bodyParser());

app.use(function (req, res, next) 
{	
  console.log('URL Requested: ' + req.url);
  console.log("User: ")
  console.log(req.user)
	next();
});




// Loading application files
//
require ('./auth');
require ('./app.js');
require ('./app-walls.js');

global.getFunctions      =   require ('./get.js');
global.saveFunctions     =   require ('./save.js');
global.removeFunctions   =   require ('./remove.js');
global._                 =   require ('underscore');


// Starting loggin
//
console.log('>>');





app.listen(process.env.PORT || 3000);   

_console.info("Server started on port 3000");
