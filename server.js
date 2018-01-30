//  OpenShift sample Node application
var express = require('express'),
    app     = express(),
    morgan  = require('morgan');
    
Object.assign=require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL,
    mongoURLLabel = "";

if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  var mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase(),
      mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD']
      mongoUser = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}
var db = null,
    dbDetails = new Object();

var initDb = function(callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    var col = db.collection('counts');
    // Create a document with request IP and current time of request
    col.insert({ip: req.ip, date: Date.now()});
    col.count(function(err, count){
      if (err) {
        console.log('Error running count. Message:\n'+err);
      }
      res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
    });
  } else {
    res.render('index.html', { pageCountMessage : null});
  }
});

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function(err){});
  }
  if (db) {
    db.collection('counts').count(function(err, count ){
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

app.get('/collections', function (req, res) {
    if (!db) {
        initDb(function (err) { });
    }
    if (db) {
        res.status(200).json({ "message": db.getCollectionNames() });
    } else {
        res.status(500).send({ message: "get-collections-db-false" });
    }
});
app.get('/closedb', function (req, res) {
    var dbStatus = 'db was closed';
    if (db) {
        dbStatus = 'db was opened';
        //to close before a build
        db.close();
    }
    res.json({ "message": dbStatus });
});
app.get('/artists', function (req, res) {
    if (!db) {
        initDb(function (err) { });
    }
    if (db) {
        var col = db.collection('artists');
        col.find({}).sort({ name_english: 1 }).toArray(function (err, artists) {
            if (err) {
                res.status(500).send({ message: "get-artists-toarray-err" });
            } else {
                res.send(artists);
            }
        });
    } else {
        res.status(500).send({ message: "get-artists-db-false" });
    }
});

app.get('/songs', function (req, res) {
    if (!db) {
        initDb(function (err) { });
    }
    if (db) {
        var col = db.collection('songs');
        col.find({}).sort({ name_english: 1 }).toArray(function (err, songs) {
            if (err) {
                res.status(500).send({ message: "get-songs-toarray-err" });
            } else {
                res.send(songs);
            }
        });
    } else {
        res.status(500).send({ message: "get-songs-db-false" });
    }
});

app.get('/artists/verified', function (req, res) {
    if (!db) {
        initDb(function (err) { });
    }
    if (db) {
        var col = db.collection('artists');
        col.find({ verified: true }).sort({ name_english: 1 }).toArray(function (err, artists) {
            if (err) {
                res.status(500).send({ message: "get-verified-artists-toarray-err" });
            } else {
                res.send(artists);
            }
        });
    } else {
        res.status(500).send({ message: "get-verified-artists-db-false" });
    }
});
app.get('/songs/verified', function (req, res) {
    if (!db) {
        initDb(function (err) { });
    }
    if (db) {
        var col = db.collection('songs');
        col.find({ verified: true }).sort({ name_english: 1 }).toArray(function (err, songs) {
            if (err) {
                res.status(500).send({ message: "get-verified-songs-toarray-err" });
            } else {
                res.send(songs);
            }
        });
    } else {
        res.status(500).send({ message: "get-verified-songs-db-false" });
    }
});

app.get('/artists/notverified', function (req, res) {
    if (!db) {
        initDb(function (err) { });
    }
    if (db) {
        var col = db.collection('artists');
        col.find({ verified: false }).sort({ name_english: 1 }).toArray(function (err, artists) {
            if (err) {
                res.status(500).send({ message: "get-notverified-artists-toarray-err" });
            } else {
                res.send(artists);
            }
        });
    } else {
        res.status(500).send({ message: "get-notverified-artists-db-false" });
    }
});
app.get('/songs/notverified', function (req, res) {
    if (!db) {
        initDb(function (err) { });
    }
    if (db) {
        var col = db.collection('songs');
        col.find({ verified: false }).sort({ name_english: 1 }).toArray(function (err, songs) {
            if (err) {
                res.status(500).send({ message: "get-notverified-songs-toarray-err" });
            } else {
                res.send(songs);
            }
        });
    } else {
        res.status(500).send({ message: "get-notverified-songs-db-false" });
    }
});

app.post('/artists/add', function (req, res) {
    if (!req.body.name_sinhala || !req.body.name_english || !req.body.base64 || !req.body.verified) {
        res.status(400).send({ message: "Artist cannot be empty" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var artistObj = new Artist({
                name_sinhala: req.body.name_sinhala,
                name_english: req.body.name_english,
                base64: req.body.base64,
                verified: req.body.verified,
                _id: req.body.name_english.toLowerCase().replace(/ /g, '_')
            });
            var col = db.collection('artists');
            col.insert(artistObj, function (err, result) {
                console.log('song result: ', result);
                if (err) {
                    res.status(500).send({ message: "post-artist-inser-err" });
                } else {
                    res.send(result);
                }
            });
            console.log('inserting to artists');
        } else {
            res.status(500).send({ message: "post-artist-db-false" });
        }
    }
});

app.post('/songs/add', function (req, res) {
    if (!req.body.name_sinhala || !req.body.name_english || !req.body.lyrics || !req.body.artists || !req.body.verified) {
        res.status(400).send({ message: "Song cannot be empty" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var songObj = new Song({
                name_sinhala: req.body.name_sinhala,
                name_english: req.body.name_english,
                lyrics: req.body.lyrics,
                artists: req.body.artists,
                verified: req.body.verified,
                _id: req.body.name_english.toLowerCase().replace(/ /g, '_')
            });
            var col = db.collection('songs');
            col.insert(songObj, function (err, result) {
                if (err) {
                    res.status(500).send({ message: "post-song-inser-err" });
                } else {
                    res.send(result);
                }
            });
            console.log('inserting to songs');
        } else {
            res.status(500).send({ message: "post-song-db-false" });
        }
    }
});

// error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;



