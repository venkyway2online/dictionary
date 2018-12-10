var prompt = require('prompt');

// This json object is used to configure what data will be retrieved from command line.
var prompt_attributes = [
    {
        // The fist input text is assigned to username variable.
        name: 'username',
        // The username must match below regular expression.
        validator: /^[a-zA-Z\s\-]+$/,
        // If username is not valid then prompt below message.
        warning: 'Username is not valid, it can only contains letters, spaces, or dashes'
    },
    {
        // The second input text is assigned to password variable.
        name: 'password',
        // Do not show password when user input.
        // hidden: true
    },
    {
        // The third input text is assigned to email variable.
        name: 'email',
        // Display email address when user input.
        hidden: false
    }
];

// Start the prompt to read user input.
prompt.start();

// Prompt and get user input then display those data in console.
prompt.get(prompt_attributes, function (err, result) {
    if (err) {
        console.log(err);
        return 1;
    }else {
        console.log('Command-line received data:');

        // Get user input from result object.
        var username = result.username;
        var password = result.password;
        var email = result.email;
        var message = "  Username : " + username + " , Password : " + password + " , Email : " + email;

        // Display user input in console log.
        console.log(message);
    }
});