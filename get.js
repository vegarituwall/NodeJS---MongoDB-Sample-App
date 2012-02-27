// Log
//
console.log("Loaded: get.js");






exports.getCollectionItem = function (collectionName, itemId, res)
{
  console.log('Getting collection: ' + collectionName + ' item id: ' + itemId);

  // Get from DB
  //

  var collection = new mongodb.Collection(mongoClient, collectionName);

  collection.find({_id: new mongoClient.bson_serializer.ObjectID(itemId)}).toArray(function(err, results) {


    if (err){
      console.log('Error getting id: ' + itemId);
    }

    if ( results.length > 0 )
    {
      console.log('Item not found.');
      res.send(results[0]);              
    }
    else
    {
      res.send('{ "result_count": 0}')
    }

  });


}









exports.getWallData = function (itemId, callback )
{
  console.log('getWallData ID: ' + itemId);
  // Get from DB
  //



  var collection      = new mongodb.Collection(mongoClient, 'walls');
  var usersCollection = new mongodb.Collection(mongoClient, 'users');

  var compare_id;

  if ( itemId.length === 24 )
  compare_id = { _id: new mongoClient.bson_serializer.ObjectID(itemId) };
  else
  compare_id = { rituwall_id: itemId };

  // Main Wall
  collection.find(compare_id).toArray(function(err, results) 
  {  
    
    if (err) console.log('Error getting id: ' + itemId);
    
    console.log('Executing getWallData...');
    

    if ( results && results.length > 0 )
    {              
      if ( results[0] !== null )
      {

        var usersObj = results[0].users;

        console.log(usersObj);

        // Nest sub collections for walls
        //
        // Get Users
        usersCollection.find({ _id : { $in : usersObj } }).toArray (function(usersErr, usersRes) 
        {
          
          if (usersErr) console.log('Error: ' + usersErr);

          MapIds(usersRes);

          // Set FB Image Value form fbid
          UsersSetFBAvatar(usersRes);

          results[0].users = usersRes;

          // Map Wall Ids
          var wallsObj = _.map(results[0].wallsIds, function(item) {
            return new mongoClient.bson_serializer.ObjectID(item);
          });

          // Get Sub Walls
          collection.find({ _id : { $in : wallsObj } }).toArray(function(wallsErr, wallsRes) 
          {
            if ( wallsErr ) console.log('Error: ' + wallsErr);

            results[0].wallsData = wallsRes;

            callback(results[0]);
          });
        });
      }
    }
    else
    {
      callback('{ "result_count": 0}')
    }
  });

}







/**
* Returns an object with rituwall user info
* given a Facebook User Id.
*/
exports.getUserByFbId = function ( fbUserId, callback )
{

  var usersCollection = new mongodb.Collection(mongoClient, 'users');

  usersCollection.find({fbid: fbUserId}, {limit:1}).toArray(function(errUser, resUser){

    if (errUser) console.log(errUser);
    
    if ( resUser[0] ) {
      if ( resUser[0].fbid ) {
        resUser[0].fb_id = resUser[0].fbid;
        resUser[0].image = 'http://graph.facebook.com/'+resUser[0].fbid+'/picture';
        resUser[0].locale = 'en_US';
      }
      if ( resUser[0]._id )  resUser[0].id = resUser[0]._id;
      callback(resUser[0]);
    } 
    else
    {
      console.log('getUserByFbId: return null.');
      callback(null);
    }
    
     
  });

}











exports.getUsers = function (collectionName, itemId, res)
{
  console.log('Getting collection: ' + collectionName + ' item id: ' + itemId);

  var collection      = new mongodb.Collection(mongoClient, collectionName);

  collection.find({ _id: new mongoClient.bson_serializer.ObjectID(itemId) }).toArray(function(err, results) 
  {  
    if (err) console.log('Error getting id: ' + itemId);

    if ( results.length > 0 )
    {              
      if ( results[0] !== null )
      {
        var data = results[0];
        data.id = data._id;
        res.send(data);
      }
    }
    else
    {
      res.send('{ "result_count": 0}')
    }
  });
}












exports.getCollectionName = function (collectionName, res)
{
  var data, docs, docs2;
  var collection = new mongodb.Collection (mongoClient, collectionName);

  collection.find({}, {limit:10}).toArray(function(err, docs) {
    docs2 = MapIds(docs);				
    res.send(docs2);
  });
}














exports.getUserByValue = function ( fieldName, value, res)
{
  var collection = new mongodb.Collection (mongoClient, 'users');
  var criteria = {};

  criteria[fieldName] = value;

  collection.find(criteria, {limit:1}).toArray(function(err, docs) {
    res.send(docs[0]);
  });                    
}






/**
* Iterates over an array and copies
* the field _id to id per document.
* 
* @param collection array 
*/
function MapIds(col)
{
  if (col )
  {
    for (var i = 0; i < col.length; i++ )
    {
      if ( col[i].id === undefined )
      col[i].id = col[i]._id;
    }  
  }
  return col;
}






function UsersSetFBAvatar(col)
{
  if (col )
  {
    for (var i = 0; i < col.length; i++ )
    {
      col[i].image = 'http://graph.facebook.com/'+col[i].fbid+'/picture';
    }  
  }
  return col;
}

