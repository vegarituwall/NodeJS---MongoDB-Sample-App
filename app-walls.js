/**
* Implements the output of complete wall HTML & Bootstrap JSON.
*
*/

/**
* This route process the main wall html & Json Bootstrap.
*/
app.get('/', function (req, res) {
  
  try
  {
    console.log('Starting route: /');
    // Sudo
    // If facebook-auth has a user logged in.
    // If user not found -> create user/wall documents.
    // If user found -> retrieve user data & wall data.
    // Output file & wall data.
    //

    var serverName = req.headers.host;
    var slug = serverName.split('.')[0];

    if ( slug !== 'www' && slug !== 'rituwallmongodb' && serverName.split('.').length > 1)
    {
      console.log('Wall-Slug: ' + slug)
      appWallgetWallBySlug(slug, req, function(wallDocId){
        console.log('Wall by Slug: ' + wallDocId );
        appGetRituwallById(wallDocId, req, function(rituwallWata){
          res.send(rituwallWata); 
        });
      })
      
      //appWallgetWallForUser(userName, req, res);        
    }
    else
    {
      console.log('Wall by UserName or Empty Wall.');
      if ( req.user !== undefined )
      { 
        //console.log(req.user);
        console.log('User fbid:' + req.user.id);
        verifyUserAccount( req.user.id, function(verifyResults) {  
          if ( verifyResults ) 
          {
            console.log('User account verified.');
            appGetRituwallById(verifyResults.wallId, req, function(rituwallData) {
              res.send(rituwallData); 
            });
          }
          else
          {
            // Create User Account & Wall Document
            //
            appInitUser(req.user, function(newUserId, newWallId)
            {                
              appGetRituwallById(newWallId, req, function(rituwallWata){
                res.send(rituwallWata); 
              });
            });
          }
        });
      }
      else 
      {
        console.log('Empty Wall');
        console.log('No user logged in.');
        appGetEmptyWall(req, function(emptyWall) {
          res.send(emptyWall); 
        });
      }
    }
  }
  catch (err)
  {
    console.log('Main route error: ', err);
  }
});






function appWallgetWallBySlug(slug, req, callback)
{
  var collectionW = new mongodb.Collection(mongoClient, 'walls');

  collectionW.find({slug: slug}, {limit: 1}).toArray( function(err, doc){
    if ( doc[0] ) callback(doc[0]._id);
    else callback('');
  });

}










function appInitUser(fbUserData, callback)
{          
          // Create Ids
          var _UserId = new mongoClient.bson_serializer.ObjectID();
          var _WallId = new mongoClient.bson_serializer.ObjectID();              
          
          var collectionW = new mongodb.Collection(mongoClient, 'walls');
          var collectionU = new mongodb.Collection(mongoClient, 'users');
          
          var wallData = { _id: _WallId, categories: [ {cat_ID: 1, cat_name: "Home", layout: "blog"} ], wallSettings: { title: "New Wall"}, users: [_UserId]  };
          var userData = { _id: _UserId, fbid: fbUserData.id, wallId: _WallId };
          
          // Insert Records
           collectionW.insert ( wallData, { safe: true },
            function (err, objects) 
            {
               if (err) console.log('Error');
               collectionU.insert ( userData, { safe: true },
               function (err, objects) 
               {
                 if (err) console.log('Error');  
                 callback(_UserId, _WallId); 
               });
            });
  
}













function verifyUserAccount ( fbUserId, callback )
{
  // Check users collection for account for user
  //


            var collection   = new mongodb.Collection (mongoClient, 'users');
            
		  	    collection.find( { fbid: fbUserId }, {limit:1}).toArray( function(err, docs) {
              if (err) console.log(err);
              
                if ( docs[0])
                  callback(docs[0]);
                else
                  callback(null);
              });         
                    
}







function appGetRituwallById ( _RituwallId, req, callback ) 
{
  var wallIdString = _RituwallId.toString();
  
  console.log("appGetRituwallById: " + wallIdString);

  var fs = require('fs');

  fs.readFile(indexFile1, function (err, data1) 
  {
    if (err) throw err;

    fs.readFile(indexFile2, function (err, data2) 
    {  
      if (err) throw err;

      getFunctions.getWallData(wallIdString, function (wallData) 
      {  
        //if ( wallData.users )          
        //  wallData.currentUser = { "id": wallData.users[0], "username": wallData.users[0].username, "fbuid": wallData.users[0].fbid, wallIds: wallData.users[0].wallsIds, "is_logged_in": true }
        if ( req.user )
        {
          console.log('appGetRWById: req.user defined.');
          wallData.facebookUser = req.user;
          getFunctions.getUserByFbId( req.user.id, function (loggedUser) {
            
            loggedUser.is_logged_in = true;
            
            if (  wallData.users && wallData.users.length > 0 )
              loggedUser.wallIds = wallData.users[0].wallsIds;
            
            console.log(loggedUser);

            //wallData.currentUser = { "id": loggedUser, "fbuid": wallData.users[0].fbid, wallIds: wallData.users[0].wallsIds, "is_logged_in": true };

            wallData.loggedRwUser = loggedUser;
            wallData.currentUser = loggedUser;
            wallData.walls = loggedUser.wallsIds;

            callback( data1 + 'var RW_bootstrapped_JSON = ' + JSON.stringify(wallData, null, 2) + ' \n\n\n' + data2 ); 
          });
        }
        else
        {
          console.log('appGetRWById: req.user undefined.');
                    
          var currentUser = { is_logged_in : false, wallIds: [] };
          wallData.currentUser = currentUser;

          if ( wallData.users && wallData.users.length > 0 )
          {
            wallData.currentUser.id = wallData.users[0].id;
            wallData.currentUser.is_logged_in = false;
          }
          // Hack to work locally
          //
          
          wallData.currentUser.is_logged_in = true;
          wallData.walls = [ { "id": "4ee28d26f96711bdd7000002", "title": "Rituwall Team"}];
          wallData.currentUser.wallIds = ["4ee28d26f96711bdd7000002"];

          //
          callback( data1 + 'var RW_bootstrapped_JSON = ' + JSON.stringify(wallData, null, 2) + ' \n\n\n' + data2 );          
        }
      });
    });
  });
} 







function appGetEmptyWall(req, callback ) 
{
    var fs = require('fs');
    
    fs.readFile(indexFile1, function (err, data1) {
    
      if (err) throw err;
      
      fs.readFile(indexFile2, function (err, data2) {
       
        getFunctions.getWallData('4ecb00e6e5b693e458000001', function (wallData) {
                    
              // Hard coded fake user in DB and Mapped to Wall
              // (visitor user id)
              // (attached Sample Wall Id)
              //
              wallData.currentUser = { "id": "4ee8ffea459415a830000001", "username": "visitor", "fbuid": 12345, wallIds: ["4ecb00e6e5b693e458000001"], "is_logged_in": false }
              wallData.wallSettings = { 'title': 'Sample Wall'};
              callback( data1 + 'var RW_bootstrapped_JSON = ' + JSON.stringify(wallData) + ' \n\n\n' + data2 ); 
        });
    });
  }); 
}








function appWallgetWallForUser ( userName, req, res ) {

  // Parse wall html 
  //

  var fs = require('fs');

  fs.readFile(indexFile1, function (err, data) {

    if (err) throw err;

    fs.readFile(indexFile2, function (err, data2) {

      var str = '';

      var collection   = new mongodb.Collection (mongoClient, 'users');
      var collection2  = new mongodb.Collection (mongoClient, 'users');
      var criteria = {};

      criteria["username"] = userName;

      collection.find( { username: "javier"}, {limit:1}).toArray( function(err, docs) {

        if (err) console.log(err);

        var userWallId = docs[0].wallId;

        console.log('Request WallId:' + userWallId);

        getFunctions.getWallData(userWallId, function (wallData) {

          // Add Info about Current User


          if ( req.user )
          {                    
            wallData.currentUser = { "id": "4ecaccf3a0977eeb27fc983c", "username": "javier", "fbuid": 12345, wallIds: [1,2,3,4], "is_logged_in": true }
            wallData.facebookUser = req.user;
            getFunctions.getUserByFbId( req.user.id, function (loggedUser) {
              wallData.loggedRwUser = loggedUser;
              res.send( data + 'var RW_bootstrapped_JSON = ' + JSON.stringify(wallData) + ' \n\n\n' + data2 ); 
            });
          }
          else
          {
            wallData.currentUser = { "id": "4ecaccf3a0977eeb27fc983c", "username": "javier", "fbuid": 12345, wallIds: [1,2,3,4], "is_logged_in": false }
            res.send( data + 'var RW_bootstrapped_JSON = ' + JSON.stringify(wallData) + ' \n\n\n' + data2 ); 
          }


        });

      });                     

    });
  });
}