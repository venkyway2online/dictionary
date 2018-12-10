

const request = require('request');

var types = ["synonyms","antonyms","definitions","sentences"];

var options = {
    url: 'http://localhost:3004/check/getSpecificDictInfo',
    method: 'post',
    json: true,
    body: {}
};

var typeObj = {
    "synonyms":1,
    "antonyms":2,
    "definitions":3,
    "examples":4,
    "dictInfo":5
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
    },
    {
        // The second input text is assigned to password variable.
        // warning : 'choose type synonyms or antonyms or definitions or examples ',
        name: 'type'

        // validator: types.includes(type)
        // Do not show password when user input.
        // hidden: true
    }
];

// Start the prompt to read user input.
prompt.start();
console.log("EMPTY WORD  (or) EMPTY TYPE  FOR EXIT \n");
execute();
function execute(){


// Prompt and get user input then display those data in console.
    prompt.get(prompt_attributes, function (err, result) {
        if (err) {
            console.log(err);
            return 1;
        }else {
            // Get user input from result object.
            var word = result.word;
            var type = result.type;

            if(word !== '' && type !== ''){
                console.log('Command-line received data:');
                var message = "  word : " + word + " , type : " + type + " ";

                // Display user input in console log.
                console.log(message);
                if(Object.keys(typeObj).includes(type)){

                    if(type === "dictInfo"){

                        options.url = "http://localhost:3004/check/getFullDict";

                    }else{
                        options.url = "http://localhost:3004/check/getSpecificDictInfo";
                    }
                    options.body = {
                        "word":word,
                        "type":typeObj[type]
                    };
                    request(options, function (err, respp, body) {
                        if(err){
                            console.log(err);
                        }else{
                            console.log(respp.body);
                            setImmediate(function () {

                                console.log("\n \n \nEMPTY WORD  (or) EMPTY TYPE FOR EXIT");
                                execute();
                            })

                        }
                    });
                }else{
                    console.log("invalid input");
                }
            }else{
                console.log("Exit");
                prompt.stop();
            }


        }
    });
}


function game() {
    
}



