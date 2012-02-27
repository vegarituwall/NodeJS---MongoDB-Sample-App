// Log
console.log("Loaded: save.js");



/**
* Updates a document using $set operator, given the data object.
* This function doesn't delete items, just update the ones sent.
*/
exports.saveCollectionItem = function(collectionName, data, res)
 {
    var data_to_object;

    data_to_object = JSON.parse(data);

    if (data_to_object === undefined) return;


    var collection = new mongodb.Collection(mongoClient, collectionName);

    if (data_to_object._id !== undefined)
    {
        var update_id = data_to_object._id;
        delete(data_to_object._id);

        collection.update(
        {
            _id: new mongoClient.bson_serializer.ObjectID(update_id)
        },
        {
            $set: data_to_object
        },
        {
            safe: true,
            upsert: true
        },
        function(err, objects)
        {
            console.log('Update record.');
            if (err) console.warn('Warning' + err.message);
            data_to_object._id = update_id;
            res.send(data_to_object);
        });
    }
}






// Saves or creates a new wall
//
exports.saveWallData = function(wallId, data, res)
 {
    // Data inserted
    //
    var data_to_object;

    if (data !== undefined)
    {
        data_to_object = JSON.parse(data);
        if (data_to_object === undefined) return;
    }

    // Do Insert or Update
    //

    var collection = new mongodb.Collection(mongoClient, 'walls');

    // By default front end set false id when a new item.
    //
    if (data_to_object !== null && data_to_object.id === false)
    delete(data_to_object.id);

    if (data_to_object !== null && data_to_object.id !== undefined)
    {
        collection.update(
        {
            _id: data_to_object.id
        },
        {
            $set: data_to_object
        },
        {
            safe: true,
            upsert: true
        },
        function(err, objects)
        {
            console.log('Update record.');
            if (err) console.warn('Warning' + err.message);
            data_to_object.db_action = 'updated';
            dataRes = data_to_object;
            res.send(dataRes);
        });
    }
    else
    {
        console.log('Inserting empty wall.');

        if (data_to_object === null)
        {
            // before adding - rituwall id
            //data_to_object            = { id: wallId, _id: wallId };
            data_to_object = {
                rituwall_id: wallId
            };

            console.log('craeted empty object');
        }
        collection.insert(
        data_to_object,
        {
            safe: true
        },
        function(err, objects)
        {
            console.log('Insert record.');
            if (err) console.warn('Warning' + err.message);
            if (err && err.message.indexOf('E11000 ') !== -1) {
                // this _id was already inserted in the database
                }
            dataRes = objects[0];
            res.send(dataRes);
        });
    }

}












// Saves or creates new data for a sub collection in a wall
//
exports.saveWallSubCollection = function(wallId, action, subCollection, data, callback)
 {
    // Data inserted
    //
    var data_to_object,dataRes;

    data_to_object = data;

    if (data_to_object === undefined) callback('');

    // Do Insert or Update
    //

    var collection = new mongodb.Collection(mongoClient, 'walls');
    
    
    console.log('Called saveWallSubCollection with ID: ' + wallId + ', action: ' + action);

    if (data_to_object.id === undefined || action === 'set' || data_to_object.id === false)
    {
       console.log('if #1');
      
        var new_id;
        var pushObject = {};
        var actionObject = {};
        var options = {
            safe: true,
            upsert: true
        }
        var criteria;

        if (wallId.length === 24)
        criteria = {
            _id: new mongoClient.bson_serializer.ObjectID(wallId)
        };
        else
        criteria = {
            rituwall_id: wallId
        };


        // Old criteria: { _id: wallId }
        // Old actionObject: { $push: pushObject }
        // Push item into collection array
        //
        if (action === 'push') {
            console.log('Pushing Tile to Wall...');
            new_id = new mongoClient.bson_serializer.ObjectID();
            data_to_object.id = new_id.toString();
            pushObject[subCollection] = data_to_object;
            actionObject = {
                $push: pushObject
            };
        }

        // Update data object value
        //
        if (action === 'set') {
            pushObject[subCollection] = data_to_object;
            actionObject = {
                $set: pushObject
            };
        }

        collection.update(criteria, actionObject, options,
        function(err, objects) {
            if (err) console.warn('Warning' + err.message);
            dataRes = data_to_object;
            callback(dataRes);
        });
    }
    else
    {
        console.log('If #2');
        var subItemId = subCollection + '.id';
        var subItemUpdate = subCollection + '.$';

        var criteria,
        set;

        if (wallId.length === 24)
        criteria = {
            _id: new mongoClient.bson_serializer.ObjectID(wallId)
        };
        else
        criteria = {
            rituwall_id: wallId
        };


        criteria[subItemId] = data_to_object.id;

        set = {};
        set[subItemUpdate] = data_to_object;

        console.log(set);
        console.log(criteria);


        // Update subCollection
        //
        collection.update(criteria, {
            $set: set
        },
        {
            safe: false,
            upsert: false
        },
        function(err, objects) {
            if (err) console.warn('Warning --> ' + err.message);
            dataRes = data_to_object;
            callback(dataRes);
        });
    }

}


















exports.updateWall = function(data, res)
{
    var data_to_object;

    data_to_object = JSON.parse(data);

    var collection = new mongodb.Collection(mongoClient, 'walls');

    // If collection has id: update it
    //
    if (data_to_object.id !== undefined)
    {
        // doc
        criteria = {
            id: data_to_object.id
        };

        // Update subCollection
        //
        collection.update(criteria, {
            $set: data_to_object
        },
        {
            safe: false,
            upsert: false
        },
        function(err, objects) {
            if (err) console.warn('Warning --> ' + err.message);
            dataRes = data_to_object;
            res.send(dataRes);
        });
    }

}







exports.createUser = function(userData, res)
{
    var dataRes,
    userDataObj;

    userDataObj = {};

    if (userData !== '')
      userDataObj = JSON.parse(userData);

    var collection = new mongodb.Collection(mongoClient, 'users');

    collection.insert(userDataObj, {
        safe: true
    },
    function(err, objects)
    {
        console.log('Create User record.');
        if (err) console.warn('Warning' + err.message);
        if (err && err.message.indexOf('E11000 ') !== -1) {
            // this _id was already inserted in the database
            }
        dataRes = objects[0];
        res.send(dataRes);
    });
    
}
