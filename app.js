var express = require('express'),
    lessMiddleware = require('less-middleware'),
    fs = require('fs'),
    fsTools = require('fs-tools');

var startApp = function() {

    var app = express();

    app.use(express.compress());

    app.use(lessMiddleware({
        src: __dirname + '/public',
        compress: (process.env.NODE_ENV == 'production'),
        once: (process.env.NODE_ENV == 'production')
    }));

    app.use(express.static(__dirname + '/public'));
    
    var port = process.env.PORT || 8000;
    app.listen(port, null, null, function() {
        console.log("Listening on port " + port);
    });

}

// Write combined metadata file from individual location metadata files
fsTools.findSorted("public/data", /[^.]+\.metadata.json/, function(err, files) {

    var metadata = {};

    for (index in files) {
        var metadataFilePath = files[index];
        var locationName = metadataFilePath.match(/([^\/.]+)\.metadata.json/)[1];

        // Exclude template file
        if (locationName != "TEMPLATE") {

            // Flag error and exit if metadata is not found
            if (!fs.existsSync(metadataFilePath)) {
                console.error("Metadata file not found for '" + locationName + "'. Aborting server start.");
                process.exit(1);
            }
            
            metadata[locationName] = JSON.parse(fs.readFileSync(metadataFilePath, 'utf8'));

        }

    }

    var metadataFileContents = "//\n// This file is auto-generated each time the application is restarted.\n//\n\nvar CITY_DATA = " + JSON.stringify(metadata) + ";";
    fs.writeFileSync("public/js/data.js", metadataFileContents);

    startApp();
    
});

