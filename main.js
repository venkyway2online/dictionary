const request = require('request');
var types = ["synonyms", "antonyms", "definitions", "sentences"];
var config = require("./config/config.json");
var env = config.process_variables.env;
var apiHost = config[env].api.host;
var apiPort = config[env].api.port;

var options = {
    url: 'http://' + apiHost + ':' + apiPort + '/check/getSpecificDictInfo',
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
        name: 'word',
        validator: /^[a-zA-Z\s\-]+$/,
        warning: 'word not valid, it can only contains letters, spaces, or dashes'
    }
];

var prompt_att2 = [
    {
        name: 'inputWord'
    }
];

var chooseExecution = [
    {
        name: 'choice'
    }
];


// Start the prompt to read user input.
prompt.start();

main();

function main() {
    console.log("EMPTY WORD  FOR EXIT \n");
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

                var message = "  word : " + word + " , type : " + type + " ";
                // Display user input in console log.
                console.log(message);

                if (Object.keys(typeObj).includes(type)) {

                    if (type === "dictInfo") {
                        options.url = "http://" + apiHost + ":" + apiPort + "/check/getFullDict";
                    } else {
                        options.url = "http://" + apiHost + ":" + apiPort + "/check/getSpecificDictInfo";
                    }
                    options.body = {
                        "word": word,
                        "type": typeObj[type]
                    };
                    request(options, function (err, respp, body) {
                        if (err) {
                            console.log(err);
                        } else {

                            if(respp.body.status === 500){
                                console.log(respp.body.error);
                            }else if(respp.body.status === 200){
                                console.log(respp.body.data);
                            }else{
                                console.log('invalid response from server');
                                prompt.stop();
                            }

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
    var message = " GAME STARTED \n";
    console.log(message);
    console.log("Enter 'qqq' for quit the game \n");

// **************************************************************************************************************
    //FOR SHUFFLING STRINGS
    String.prototype.shuffle = function () {
        var a = this.split(""),
            n = a.length;

        for (var i = n - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }
        return a.join("");
    };
//****************************************************************************************************************

    options.method = 'get';
    options.url = "http://" + apiHost + ":" + apiPort + "/check/getRandomWord";

    //CALL GET FOR FETCH RANDOM WARD
    request(options, function (err, respp, body) {
        if (err) {
            console.log(err);
        } else {

            if(respp.body.status === 500){
                console.log(respp.body.error);
                console.log("no word found in dict some problem is here ");
                prompt.stop();
            }else if(respp.body.status === 200){
                var word = respp.body.data.toString().trim();
            }else{
                console.log('invalid response from server');
                prompt.stop();
            }

            options.url = "http://" + apiHost + ":" + apiPort + "/check/getFullDict";
            options.method = 'post';
            options.body = {
                "word": word,
                "type": 5
            };


            //FETCH ALL INFORMATION OF A WORD FROM DICT API
            request(options, function (err, respp, body) {
                if (err) {
                    console.log(err);
                } else {

                    if(respp.body.status === 500){
                        console.log(respp.body.error);
                    }else if(respp.body.status === 200){
                        var totalData = respp.body.data;
                    }else{
                        console.log('invalid response from server');
                        prompt.stop();
                    }


                    if (totalData === "word not found in dict") {
                        console.log("word not found please wait");
                    } else {

                        hints = generateHints(Object.keys(totalData));

//**********************************************************************************************************************
                        checkUserInput('');


                        function checkUserInput(jWordNow) {
                            if (hints.length > 0) {

                                if (jWordNow !== '') {
                                    console.log("Hint : Rearrange the word ::: ", jWordNow);
                                } else {
                                    var hintNow = hintGenerator();
                                    var argg = {
                                        min: 0
                                        , max: totalData[hintNow].length - 1
                                        , integer: true
                                    };
                                    var index1 = rn(argg);
                                    var hintVal = totalData[hintNow][index1];
                                    console.log("Your hint is " + hintNow + " ::: " + hintVal);
                                }
                                prompt.get(prompt_att2, function (err, rss) {
                                    if (err) {
                                        throw  err;
                                    } else {
                                        if (rss.inputWord === word) {
                                            console.log("correct word successfully");
                                            // console.log(totalData);
                                        } else {
                                            if (rss.inputWord === "qqq") {
                                                console.log("your word is here  ::" + word);
                                                prompt.stop();
                                            } else {
                                                console.log("incorrect  try again");
                                                jWordNow = '';
                                                setImmediate(function () {
                                                    checkUserInput(jWordNow);
                                                })
                                            }
                                        }
                                    }
                                })

                            } else {

                                hints = generateHints(Object.keys(totalData));
                                jumbledWord(function (jWord) {
                                    checkUserInput(jWord);
                                });

                            }
                        }

//*****************************************************************************************************************
                        // internal functions
                        function jumbledWord(cb) {
                            var jWord = word.shuffle();
                            if (word !== jWord) {
                                cb(jWord);
                            } else {
                                setImmediate(function () {
                                    jumbledWord(cb);
                                })

                            }
                        }


//**********************************************************************************************************************
                        function generateHints(tempHintArr) {
                            tempHintArr.forEach(function (tempHint) {
                                if (orgHints.includes(tempHint) && totalData[tempHint].length > 0) {
                                    hints.push(tempHint);
                                }
                            });

                            return hints;
                        }
//**********************************************************************************************************************
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
//**********************************************************************************************************************
                    }

                }
            });

        }
    });


}




