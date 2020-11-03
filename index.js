// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
const PostmarkAdapter = require("parse-server-postmark-adapter");

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || "mongodb://localhost:27017/dev",
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + "/cloud/main.js",
  appId: process.env.APP_ID || "416415eb0bd50de9ef3b409025ae95ce",
  masterKey: process.env.MASTER_KEY || "8e8c61b94defd40e6ac1bc028d1323f9", //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || "https://e-signature.warp.click/parse", // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"], // List of classes to support for query subscriptions
  },
  appName: "My First Server",
  publicServerURL: "https://e-signature.warp.click/parse",
  verifyUserEmails: true,
  emailAdapter: PostmarkAdapter({
    apiKey: "b5cc1f42-ac04-4d61-a8ae-2d92aee7519b",
    fromAddress: "info@dome.cloud",

    // Verification email subject
    verificationSubject: "Please verify your e-mail for *|appname|*",
    // Verification email body. This will be ignored when verificationTemplateName is used.
    verificationBody:
      "Hi *|username|*,\n\nYou are being asked to confirm the e-mail address *|email|* with *|appname|*\n\nClick here to confirm it:\n*|link|*",
    // Password reset email subject
    passwordResetSubject: "Password Reset Request for *|appname|*",
    // Password reset email body. This will be ignored when passwordResetTemplateName is used.
    passwordResetBody:
      "Hi *|username|*,\n\nYou requested a password reset for *|appname|*.\n\nClick here to reset it:\n*|link|*",

    /****************************************
     * If you are using Postmark templates: *
     ****************************************/

    //
    // If you want to use other custom User attributes in the emails
    // (for example: firstName, lastName), add them to the list (username and email
    // are pre-loaded).
    // The merge tag in the template must be equal to the attribute's name.
    customUserAttributesMergeTags: ["firstname", "lastname"],

    //
    // The name of your Postmark template for the password reset email:
    // If you add this attribute, then passwordResetBody will be ignored.
    // IMPORTANT: Make sure the email has the *|link|* merge tag,
    //            it will render the url to reset the password.
    passwordResetTemplateId: "password-reset-template-id",

    //
    // The name of your Postmark template for the verification email:
    // If you add this attribute, then verificationBody will be ignored.
    // IMPORTANT: Make sure the email has the *|link|* merge tag,
    //            it will render the url to verify the user.
    verificationTemplateId: "email-verification-template-id",
  }), // Enable email verification
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
