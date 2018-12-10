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

var words =[];

var inputStream = fs.createReadStream('/home/av/Desktop/api_validate_email_140/data/words.csv', 'utf8');

inputStream
    .pipe(CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
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
    2: "antonyms"
};

router.post("/getSynonyms", function (req, res) {
    var word = getInputWordFromReq(req);
    getDataFromOxford(word, types["2"], function (err, output) {
        var synonyms = getFramedOutput(output, types["2"]);
        if(synonyms){
            logger.log(synonyms);
        }else{
            logger.log("word not found in dict");
        }

    })
});


router.post("/getAntonyms", function (req, res) {

});

router.post("/getDefinition", function (req, res) {

});

router.post("/getExamples", function (req, res) {

});

router.post("/getFullDict", function (req, res) {

});

router.post("/getWordOftheDayDict", function (req, res) {
    var options = {
        min:  -1000
        , max:  1000
        , integer: true
    };
    rn(options)
});


router.post("/wordGame", function (req, res) {


});


function getInputWordFromReq(req) {
    return req.body.word;
}


function getFramedOutput(output, type) {
    var finalOutput = [];
    try{
        var lexicalEntries = JSON.parse(output).results[0].lexicalEntries;
        lexicalEntries.forEach(function (lexicalEntry) {
            lexicalEntry.entries.forEach(function (entry) {
                entry.senses.forEach(function (sense) {
                    sense['' + type].forEach(function (obj) {
                        finalOutput.push(obj["id"]);
                    })
                })
            })
        });
        return finalOutput;
    }catch (e) {
        return null;
    }

}

function getDataFromOxford(searchInput, type, cb) {

    var path = "/api/v1/entries/en/" + searchInput + "/" + type + "";

    console.log("searchInput " + searchInput);
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