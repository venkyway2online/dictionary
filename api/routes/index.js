var express = require('express');
var router = express.Router();
var logger = require('tracer').colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{path}}:{{line}})',
    dateformat: 'dd-mm-yyyy HH:MM:ss TT'
});
var request = require('request');
var https = require('https');
var config = require('./../../config/config.json');
var rn = require('random-number');

var env = config.process_variables.env;

var fs = require('fs');
var CsvReadableStream = require('csv-reader');

var async = require('async');

var words = [];

var inputStream = fs.createReadStream(config[env].api.filepath, 'utf8');

inputStream
    .pipe(CsvReadableStream({parseNumbers: true, parseBooleans: true, trim: true}))
    .on('data', function (row) {
        words.push(row[0]);
    })
    .on('end', function (data) {
        router.use(function (req, res, next) {
            next();

        });
    });

var types = {
    1: "synonyms",
    2: "antonyms",
    3: "definitions",
    4: "sentences",
    5: "wordlist"
};

router.post("/getSpecificDictInfo", function (req, res) {
    var input = getInputWordFromReq(req);

    if (valid(input[0]) && valid(input[1]) && validType(input[1])) {
        getRequiredData(input[0], input[1], function (err, finalData) {
            if (err) {
                res.send(err);
            } else {
                res.send(finalData);
            }
        })
    } else {
        res.send('invalid input');
    }

});


// router.get("/getRandomWord",function (req,res) {
//     getDataFromOxford('',5,function (err,output) {
//         var wordlist = getFramedOutput(output,'wordlist');
//         if(wordlist && wordlist.length >0){
//             var options = {
//                 min:  0
//                 , max:  wordlist.length-1
//                 , integer: true
//             };
//             var ind = rn(options);
//             // res.send(wordlist[ind]);
//             res.send('good');
//         }else{
//             res.send(null);
//         }
//
//     })
//
// });
//
router.get("/getRandomWord", function (req, res) {
    if (words && words.length > 0) {
        var options = {
            min: 0
            , max: words.length - 1
            , integer: true
        };
        var ind = rn(options);
        // res.send(wordlist[ind]);
        res.send(words[ind]);
        // res.send('celerity');
    } else {
        res.send(null);
    }


});


function getRequiredData(val1, val2, cb2) {
    getDataFromOxford(val1, val2, function (err, output) {
        var requiredData = getFramedOutput(output, types[val2]);
        if (requiredData) {
            var obj = {};
            obj[types[val2]] = requiredData;
            cb2(null, obj);
        } else {
            var msg = "word not found in dict";
            cb2(msg, null);
        }

    })
}

router.post("/getFullDict", function (req, res) {
    var input = req.body.word;
    async.parallel([
            function (callback) {
                getRequiredData(input, 1, callback)
            },
            function (callback) {
                getRequiredData(input, 2, callback);
            },
            function (callback) {
                getRequiredData(input, 3, callback);
            }, function (callback) {
                getRequiredData(input, 4, callback);
            }

        ],
        function (err, results) {
            // console.log(results);
            // console.log("ok");
            if (err) {
                res.send(err);
            } else {
                // res.send(results);
                var finalObj = {};

                results.forEach(function (resss) {
                    var key = Object.keys(resss);
                    finalObj[key] = resss[key];

                });
                res.send(finalObj);

            }
        });
});

router.post("/getWordOftheDayDict", function (req, res) {
    var options = {
        min: -1000
        , max: 1000
        , integer: true
    };
    rn(options)
});


router.post("/wordGame", function (req, res) {

});


function getInputWordFromReq(req) {
    var out = [];
    out.push(req.body.word);
    out.push(req.body.type);
    return out;
}


function valid(input) {
    return input !== null && input !== undefined;
}


function validType(val) {
    return [1, 2, 3, 4].includes(val);
}


function getFramedOutput(output, type) {
    var finalOutput = [];
    try {
        if (type === "wordlist") {


            var results = JSON.parse(output).results;
            results.forEach(function (result) {
                finalOutput.push(result.word);
            })


        } else {
            var lexicalEntries = JSON.parse(output).results[0].lexicalEntries;
            lexicalEntries.forEach(function (lexicalEntry) {
                if (type === types['4']) {
                    lexicalEntry['' + type].forEach(function (sentence) {
                        finalOutput.push(sentence['text']);
                    })
                } else {
                    lexicalEntry.entries.forEach(function (entry) {
                        JSON.stringify(entry);

                        entry.senses.forEach(function (sense) {
                            // finalOutput.push(sense['' + type][0])
                            if (type === types['3']) {
                                finalOutput.push(sense['' + type][0])
                            } else {
                                sense['' + type].forEach(function (obj) {
                                    finalOutput.push(obj['id']);
                                })
                            }

                        })

                    })
                }
            });
        }

        return finalOutput;
    } catch (e) {
        return [];
    }

}

function getDataFromOxford(searchInput, typeFlag, cb) {

    var type = types[typeFlag];
    var path = '';

    if (type === "wordlist") {
        path = "https://od-api.oxforddictionaries.com:443/api/v1/wordlist/en/lexicalCategory%3Dverb";
    } else {
        path = "/api/v1/entries/en/" + searchInput + "/" + type + "";
    }


    //console.log("searchInput " + searchInput);
    var output = '';
    var error = null;
    var postRequest = {
        host: "od-api.oxforddictionaries.com",
        path: path,
        port: "443",
        method: "GET",
        rejectUnauthorized: false,
        headers: {
            "Accept": "application/json",
            'app_key': "52582f496e8ae6fb88c139cd2de4f875",
            'app_id': "bc37d1d4"
        }
    };

    var request = https.request(postRequest, function (response) {
        response.on("data", function (data) {
            output = output + data;
        });
        response.on("end", function (data) {
            cb(error, output);
        });
    });


    request.on('error', function (error) {
        console.log('problem with request: ' + error.message);
        cb(error.message, output);
    });

    request.write(JSON.stringify(path));

}

module.exports = router;