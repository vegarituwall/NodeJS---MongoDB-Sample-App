// Log
console.log("Loaded: remove.js");


/** Remove item from a sub-collection on the wall collections.
*
*/
exports.removeSubCollectionItem = function (wallId, subCollection, data, callback)
{
  var data_to_object, dataRes;

  data_to_object = JSON.parse(data);

  if ( data_to_object !== undefined ) 
  {
    var collection = new mongodb.Collection(mongoClient, 'walls');

    if ( data_to_object.id !== undefined )
    {
      var subItemId = subCollection + '.id';
      var subItemUpdate = subCollection;
      var criteria;

      if ( wallId.length === 24 )
      criteria = { _id: new mongoClient.bson_serializer.ObjectID(wallId) };
      else
      criteria = { rituwall_id: wallId };

      set = {};
      set[subItemUpdate] = { id : data_to_object.id };

      collection.update( criteria, { $pull : set }, { safe : false, upsert : true }, function (err, objects) {
        if (err) console.warn('Warning --> ' + err.message);
        dataRes = data_to_object;
        callback(dataRes);
      });
    }
    else
    {
      callback('');
    }         
  }
  else
  {
    callback('');
  }
}




/**
* Unset a value from root wall document level.
*/
exports.unsetField = function (wallId, data, res)
{
  var field = data;

  if ( field !== '' )
  {
    var collection = new mongodb.Collection(mongoClient, 'walls');

    var criteria;

    if ( wallId.length === 24 )
    criteria =  { _id: new mongoClient.bson_serializer.ObjectID(wallId) };
    else
    criteria = { rituwall_id: wallId };

    var unsetObject = {};

    unsetObject[field] = 1;

    collection.update( criteria, { $unset : unsetObject }, { safe : false }, function (err, objects) {  
      if (err) console.warn('Warning --> ' + err.message);
      dataRes = field;
      res.send(dataRes);
    });
  }
} 








/**
* Remove a user from users document.
*/
exports.removeUser = function (userId, res){

  console.log('Removing user:' + userId);

  var collection = new mongodb.Collection(mongoClient, 'users');

  if ( userId !== undefined )
  {
    var criteria = {};        

    criteria =  { _id: new mongoClient.bson_serializer.ObjectID(userId) };

    collection.remove( criteria, {safe:true}, function (err, result) {  
      if (err) console.warn('Warning --> ' + err.message);
      var removed;
      removed = { "removed": result }
      res.send(removed);
    });
  }
}


