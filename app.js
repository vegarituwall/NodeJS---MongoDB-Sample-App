// Log
console.log("Loaded: app.js");


// Libraries
mustache  = require("shift").engine("mustache")
fs        = require('fs')
errors    = require('./error-handling');


// Get Routing
// 

app.get('/admin', function (req, res) {
    
    fs = require('fs');
    
    fs.readFile("./views/admin.html", 'utf8', function(err, text){
        res.send(text);
    });    
});

app.get('/login', function (req, res) {
	fs.readFile("./views/login.html", "utf-8", function(error, result) {
	  var options = {locals: req.user || {username: false}};
	  mustache.render(result, options, function(error, result) {
	    res.send(result);
	  })
	});
});


app.get('/collection/:name?', function (req, res) {	 
	getFunctions.getCollectionName(req.params.name, res);
});


app.get('/collection/:name/:id', function (req, res) {	
    getFunctions.getCollectionItem(req.params.name, req.params.id, res);
});


app.get('/create-wall/:wallId', function (req, res) {    
    saveFunctions.saveWallData(req.params.wallId, null, res);
});


app.get('/walls/:wallId', function (req, res) {
    try
    {
        console.log('Getting wall ID: ' + req.params.wallId );      
        
        getFunctions.getWallData(req.params.wallId, function(wallDataRes) {
                res.send(wallDataRes);
        });    
    }
    catch (err)
    {
        console.log(err);
        errors.procExecption(err, 'getWall', '', res);
    }
});



app.get('/users', function (req, res) {
   try
   {
       console.log('Getting users collection.');      
       getFunctions.getCollectionName('users', res);
   }
   catch (err)
   {
       errors.procExecption(err, 'getWall', req.body.data, res);
   }
});



// Get Users by any field
//
app.get('/users/:field/:value', function (req, res) {
   try
   {
       console.log('Getting users collection.');      
       getFunctions.getUserByValue(req.params.field, req.params.value, res);
   }
   catch (err)
   {
       errors.procExecption(err, 'getUsersByValue', req.body.data, res);       
   }
});




app.get('/users/:id', function (req, res) {
    try
    {
        console.log('Getting user ID: ' + req.params.id );      
        getFunctions.getUsers('users', req.params.id, res);    
    }
    catch (err)
    {
        errors.procExecption(err, 'getUsers', req.body.data, res);
    }
});



app.post('/create-user', function (req, res) {
    try
    {
        console.log('Creating new user.');      
        saveFunctions.createUser(req.body.data, res);    
    }
    catch (err)
    {
        errors.procException(err, 'createUser', req.body.data, res);
    }  
});


app.get('/remove-user/:id', function (req, res) {
    try
    {
        console.log('Remove user _id: ' + req.params.id );      
        removeFunctions.removeUser(req.params.id, res);    
    }
    catch (err)
    {
        errors.procExecption(err, 'removeUser', '', res);
    }  
});


// Post Routing
//

app.post('/collection/:name?', function(req, res) {
     
      console.log('Calling: /collection/:name? ');
          
      try
      {
          saveFunctions.saveCollectionItem(req.params.name, req.body.data, res);
      }
      catch (err)
      {
          errors.procExecption(err, 'saveCollectionItem', req.body.data, res);
      }
});



// Post Routing to one Wall Document
//

// Saves data to wall 
//
app.post('/walls/:wallId', function(req, res) {
    
    console.log('Calling: /walls/:wallId ');
    
    try
    {
        saveFunctions.saveWallData(req.params.wallId, req.body.data, res);
    }
    catch (err)
    {
        errors.procException(err, 'saveWallData', req.body.data, res);
    }

});


// Saves data to a subcollection in a wall
//
// ** action: push or set data into wall
// 
app.post('/walls/:wallId/:action/:subCollection', function(req, res) {

    console.log('Calling: /walls/:wallId/:action/:subCollection ');

    try
    {
        if ( req.params.action === 'set' || req.params.action === 'push' )
        {
            var repostWallIds = [ "4ee28d26f96711bdd7000002" ];
            console.log('Reposting walls...');
          
            // Code to repost walls
            //
            /*
            if ( subCollection === 'tiles' )
              if ( req.body.data.repostWallIds )
                repostWallIds = req.body.data.repostWallIds;
            
            if ( req.body.data.repostWallIds )
              console.log(req.body.data.repostWallIds);
            */


            saveFunctions.saveWallSubCollection(req.params.wallId, req.params.action, req.params.subCollection, req.body.data, function(wallData1){
              //Repeat posting to all other walls
              //
              console.log('Original Post.');
              console.log(repostWallIds.length);
              for ( var i = 0; i < repostWallIds.length; i++ ) 
              {
                if ( req.body.data.id ) delete(req.body.data.id)
                console.log("Reposting to wall: " + repostWallIds[i] );
                saveFunctions.saveWallSubCollection(repostWallIds[i], req.params.action, req.params.subCollection, req.body.data, function(wallData2){ 
                  console.log('Reposted OK.' + 'saveWallSubCollection');
                  res.send(wallData1);
                  });
              }              
                            
            });
        }
        if ( req.params.action === 'remove')
            removeFunctions.removeSubCollectionItem(req.params.wallId, req.params.subCollection, req.body.data, function(removeData){
              res.send(removeData);
            });
    }
    catch (err)
    {
        errors.procException(err, 'saveWallSubCollection', req.body.data, res);
    }

});



app.post('/walls/:wallId/unset', function (req, res) {
   
   console.log('Calling: /walls/:wallId/unset');
   
   try
   {
       removeFunctions.unsetField(req.params.wallId, req.body.data, res);
   }
   catch (err)
   {
       errors.procException(err, 'unsetField', req.body.data, res);
   }
   
    
});





// Updating a wall given wallId in json to update.
//
app.post('/walls', function (req, res) {

    console.log('Calling: /walls');
    
    try
    {
        saveFunctions.updateWall(req.body.data, res);
    }
    catch (err)
    {
        errors.procException(err, 'updateWall', req.body.data, res);
    }
    
});




