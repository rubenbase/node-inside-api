const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/Inside', (err, db) => {
    if (err) {
       return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    db.collection('Sales').insertOne({
        text: 'Some test sale',
        completed: false
    }, (err, result) => {
        if (err) {
            return console.log('Unable to insert sale');
        }

        console.log(JSON.stringify(result.ops, undefined, 2));
    });
    db.close();
});