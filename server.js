//  OpenShift sample Node application
var express = require('express'),
    app = express(),
    morgan = require('morgan'),
    cors = require('cors'),
    bodyParser = require('body-parser');

Object.assign = require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'));
app.use(cors({origin: 'http://localhost:8100'}));
app.use(bodyParser.json());

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
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
        mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;

    }
}
var db = null,
    dbDetails = new Object();

var initDb = function (callback) {
    if (mongoURL == null) return;

    var mongodb = require('mongodb');
    if (mongodb == null) return;

    mongodb.connect(mongoURL, function (err, conn) {
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
    res.send('{ pageCount: -1 }');
});
app.get('/pagecount', function (req, res) {
    res.send('{ pageCount: -1 }');
});
app.get('/collections', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
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
    res.setHeader('Access-Control-Allow-Origin', '*');
    var dbStatus = 'db was closed';
    if (db) {
        dbStatus = 'db was opened';
        //to close before a build
        db.close();
    }
    res.json({ "message": dbStatus });
});
app.get('/artists', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
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
    res.setHeader('Access-Control-Allow-Origin', '*');
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
    res.setHeader('Access-Control-Allow-Origin', '*');
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
    res.setHeader('Access-Control-Allow-Origin', '*');
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
    res.setHeader('Access-Control-Allow-Origin', '*');
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
    res.setHeader('Access-Control-Allow-Origin', '*');
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
app.get('/artists/notverified/:searchText', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.params.searchText) {
        res.status(400).send({ message: "searchText cannot be empty artist" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var col = db.collection('artists');
            col.find({ verified: false, name_english: { $regex: req.params.searchText, $options: 'i'} }).limit(3).sort({ name_english: 1 }).toArray(function (err, songs) {
                if (err) {
                    res.status(500).send({ message: "get-notverified-artist-search-toarray-err" });
                } else {
                    res.send(songs);
                }
            });
        } else {
            res.status(500).send({ message: "get-notverified-artist-search-db-false" });
        }
    }
});
app.get('/songs/notverified/:searchText', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.params.searchText) {
        res.status(400).send({ message: "searchText cannot be empty songs" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var col = db.collection('songs');
            col.find({ verified: false, name_english: { $regex: req.params.searchText, $options: 'i'} }).limit(3).sort({ name_english: 1 }).toArray(function (err, songs) {
                if (err) {
                    res.status(500).send({ message: "get-notverified-songs-search-toarray-err" });
                } else {
                    res.send(songs);
                }
            });
        } else {
            res.status(500).send({ message: "get-notverified-songs-search-db-false" });
        }
    }
});
app.get('/artists/search/:searchText', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.params.searchText) {
        res.status(400).send({ message: "searchText cannot be empty artist" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var col = db.collection('artists');
            col.find({ name_english: { $regex: req.params.searchText, $options: 'i'} }).limit(3).sort({ name_english: 1 }).toArray(function (err, songs) {
                if (err) {
                    res.status(500).send({ message: "get-artist-search-toarray-err" });
                } else {
                    res.send(songs);
                }
            });
        } else {
            res.status(500).send({ message: "get-artist-search-db-false" });
        }
    }
});
app.get('/songs/search/:searchText', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.params.searchText) {
        res.status(400).send({ message: "searchText cannot be empty songs" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var col = db.collection('songs');
            col.find({ name_english: { $regex: req.params.searchText, $options: 'i'} }).limit(3).sort({ name_english: 1 }).toArray(function (err, songs) {
                if (err) {
                    res.status(500).send({ message: "get-songs-search-toarray-err" });
                } else {
                    res.send(songs);
                }
            });
        } else {
            res.status(500).send({ message: "get-songs-search-db-false" });
        }
    }
});
app.post('/artists/save', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.body.name_sinhala || !req.body.name_english || !req.body.base64 || !req.body.verified) {
        res.status(400).send({ message: "Artist cannot be empty" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var artistObj = {
                name_sinhala: req.body.name_sinhala,
                name_english: req.body.name_english,
                base64: req.body.base64,
                verified: req.body.verified,
                _id: req.body.name_english.toLowerCase().replace(/ /g, '_')
            };
            var col = db.collection('artists');
            col.save(artistObj, function (err, result) {
                if (err) {
                    res.status(500).send({ message: "post-artist-save-err" });
                } else {
                    res.send(result);
                }
            });
        } else {
            res.status(500).send({ message: "post-artist-db-false" });
        }
    }
});
app.post('/songs/save', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.body.name_sinhala || !req.body.name_english || !req.body.lyrics || !req.body.artists || !req.body.verified) {
        res.status(400).send({ message: "Song cannot be empty" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var songObj = {
                name_sinhala: req.body.name_sinhala,
                name_english: req.body.name_english,
                lyrics: req.body.lyrics,
                artists: req.body.artists,
                verified: req.body.verified,
                _id: req.body.name_english.toLowerCase().replace(/ /g, '_')
            };
            var col = db.collection('songs');
            col.save(songObj, function (err, result) {
                if (err) {
                    res.status(500).send({ message: "post-song-save-err" });
                } else {
                    res.send(result);
                }
            });
        } else {
            res.status(500).send({ message: "post-song-db-false" });
        }
    }
});
app.post('/artists/add/list', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.body) {
        res.status(400).send({ message: "Artistlist cannot be empty" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var col = db.collection('artists');
            col.insertMany(req.body, function (err, result) {
                if (err) {
                    res.status(500).send({ message: "post-artistlist-inser-err" });
                } else {
                    res.send(result);
                }
            });
        } else {
            res.status(500).send({ message: "post-artistlist-db-false" });
        }
    }
});
app.post('/songs/add/list', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.body) {
        res.status(400).send({ message: "Songlist cannot be empty" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var col = db.collection('songs');
            col.insert(req.body, function (err, result) {
                if (err) {
                    res.status(500).send({ message: "post-songlist-inser-err" });
                } else {
                    res.send(result);
                }
            });
        } else {
            res.status(500).send({ message: "post-songlist-db-false" });
        }
    }
});
app.delete('/artists/delete/:artistId', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.params.artistId) {
        res.status(400).send({ message: "Artist id cannot be empty" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var col = db.collection('artists');
            col.remove({_id: req.params.artistId }, function (err, result) {
                if (err) {
                    res.status(500).send({ message: "delete-artist-err-" + req.params.artistId });
                } else {
                    res.send(result);
                }
            });
        } else {
            res.status(500).send({ message: "delete-artist-db-false" });
        }
    }
});
app.delete('/songs/delete/:songId', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!req.params.songId) {
        res.status(400).send({ message: "Song id cannot be empty" });
    } else {
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var col = db.collection('songs');
            col.remove({_id: req.params.songId }, function (err, result) {
                if (err) {
                    res.status(500).send({ message: "delete-song-err-" + req.params.songId });
                } else {
                    res.send(result);
                }
            });
        } else {
            res.status(500).send({ message: "delete-song-db-false" });
        }
    }
});
app.delete('/artists/deleteall', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!db) {
        initDb(function (err) { });
    }
    if (db) {
        var col = db.collection('artists');
        col.deleteMany({}, function (err, result) {
            if (err) {
                res.status(500).send({ message: "delete-artistall-err" });
            } else {
                res.send(result);
            }
        });
    } else {
        res.status(500).send({ message: "delete-artistall-db-false" });
    }
});
app.delete('/songs/deleteall', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (!db) {
        initDb(function (err) { });
    }
    if (db) {
        var col = db.collection('songs');
        col.deleteMany({}, function (err, result) {
            if (err) {
                res.status(500).send({ message: "delete-songall-err-" });
            } else {
                res.send(result);
            }
        });
    } else {
        res.status(500).send({ message: "delete-songall-db-false" });
    }
});


// error handling
// app.use(function (err, req, res, next) {
//     // console.error(err.stack);
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, *');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();

//     // if ('OPTIONS' === req.method) {
//     //     res.send(200);
//     // } else {
//     //     res.status(500).send('Something bad happened!');
//     // };
// });



initDb(function (err) {
    console.log('Error connecting to Mongo. Message:\n' + err);
});

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;



