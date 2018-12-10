const request = require('request');
var types = ["synonyms", "antonyms", "definitions", "sentences"];
var config = require("./config/config.json");
var env = config.process_variables.env;
var options = {
    url: 'http://'+config[env].api.host+':'+config[env].api.port+'/check/getSpecificDictInfo',
    method: 'post',
    json: true,
    body: {}
};
var rn = require('random-number');
var typeObj = {
    "synonyms": 1,
    "antonyms": 2,
    "definitions": 3,
    "examples": 4,
    "dictInfo": 5
};

var prompt = require('prompt');

// This json object is used to configure what data will be retrieved from command line.
var prompt_attributes = [
    {
        // The fist input text is assigned to username variable.
        name: 'word',
        // The username must match below regular expression.
        validator: /^[a-zA-Z\s\-]+$/,
        // If username is not valid then prompt below message.
        warning: 'word not valid, it can only contains letters, spaces, or dashes'
    }
];

var prompt_att2 = [
    {
        name: 'inputWord'
    }
];
var prompt_attributes1 = [
    {
        // The fist input text is assigned to username variable.
        name: 'game',
        // The username must match below regular expression.
        // If username is not valid then prompt below message.
    }
];

var chooseExecution = [
    {
        name: 'choice'
    }
];


// Start the prompt to read user input.
prompt.start();
console.log("EMPTY WORD  FOR EXIT \n");
main();

function main() {
    console.log(" enter 1    : synonyms \n enter 2    : antonyms \n enter 3    : definitions \n enter 4    : examples \n enter 5    : completeDictInfo \n enter NOTA : GAME"
    );
    prompt.get(chooseExecution, function (err, res) {
        if (err) {
            throw err;
        } else {
            if (valid(res)) {


                switch (res.choice) {
                    case '1':
                        execute('synonyms');
                        break;
                    case '2':
                        execute('antonyms');
                        break;
                    case '3':
                        execute('definitions');
                        break;
                    case '4':
                        execute('examples');
                        break;
                    case '5':
                        execute('dictInfo');
                        break;
                    default:
                        gaming();
                }
            }
        }
    })

}


function valid(value) {
    return value !== undefined && value !== null;
}

// execute();
// gaming();
function execute(type) {

// Prompt and get user input then display those data in console.
    prompt.get(prompt_attributes, function (err, result) {
        if (err) {
            console.log(err);
            return 1;
        } else {
            // Get user input from result object.
            var word = result.word;


            if (word !== '' && type !== '') {
                console.log('Command-line received data:');
                var message = "  word : " + word + " , type : " + type + " ";

                // Display user input in console log.
                console.log(message);
                if (Object.keys(typeObj).includes(type)) {

                    if (type === "dictInfo") {

                        options.url = "http://"+config[env].api.host+":"+config[env].api.port+"/check/getFullDict";

                    } else {
                        options.url = "http://"+config[env].api.host+":"+config[env].api.port+"/check/getSpecificDictInfo";
                    }
                    options.body = {
                        "word": word,
                        "type": typeObj[type]
                    };
                    request(options, function (err, respp, body) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(respp.body);
                            setImmediate(function () {

                                console.log("\n \n \nEMPTY WORD  FOR EXIT");
                                execute(type);
                            })

                        }
                    });
                } else {
                    console.log("invalid input");
                }
            } else {
                console.log("Exit");
                prompt.stop();
            }


        }
    });
}


function gaming() {
    var orgHints = ['synonyms', 'antonyms', 'definitions'];
    var hints = [];

    // Get user input from result object.


    var message = " game started";

    // Display user input in console log.
    console.log(message);
    options.method = 'get';
    options.url = "http://"+config[env].api.host+":"+config[env].api.port+"/check/getRandomWord";
    request(options, function (err, respp, body) {
        if (err) {
            console.log(err);
        } else {
            var word = respp.body.toString().trim();
            // console.log(word);
            ////////////////////// collect data for word;


            options.url = "http://"+config[env].api.host+":"+config[env].api.port+"/check/getFullDict";
            options.method = 'post';
            options.body = {
                "word": word,
                "type": 5
            };
            request(options, function (err, respp, body) {
                if (err) {
                    console.log(err);
                } else {
                    var totalInfo = respp.body;
                    if (respp.body === "word not found in dict") {
                        console.log("word not found please wait");
                        // gaming();
                    } else {
                        var totalData = respp.body;
                        tempHints = Object.keys(totalData);

                        tempHints.forEach(function (tempHint) {
                            if (orgHints.includes(tempHint) && totalData[tempHint].length >0) {
                                hints.push(tempHint);
                            }
                        });

                        checkUserInput();

                        function checkUserInput() {
                            if (hints.length > 0) {
                                var hintNow = hintGenerator();
                                var argg = {
                                    min: 0
                                    , max: totalData[hintNow].length - 1
                                    , integer: true
                                };
                                var index1 = rn(argg);
                                if (index1 > -1) {
                                    var hintVal = totalData[hintNow][index1];
                                    console.log("Your hint is " + hintNow + " ::: " + hintVal);
                                    prompt.get(prompt_att2, function (err, rss) {
                                        if (err) {
                                            throw  err;
                                        } else {
                                            if (rss.inputWord === word) {
                                                console.log("correct word successfully");
                                                // console.log(totalData);
                                            } else {
                                                console.log("incorrect  try again");
                                                checkUserInput();
                                            }
                                        }
                                    })
                                } else {

                                }

                            } else {
                                console.log("you failed");
                                console.log("your word is here  ::" + word);
                                prompt.stop();
                            }
                        }

                        function hintGenerator() {
                            var argss = {
                                min: 0
                                , max: hints.length - 1
                                , integer: true
                            };
                            var ind = rn(argss);

                            var hintType = hints[ind];
                            hints.splice(ind, 1);
                            return hintType;
                        }

                    }

                }
            });


            ////////////////////////////////////////////////////////////


        }
    });


}




