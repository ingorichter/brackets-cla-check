/*global require, console, process */
"use strict";

var Promise = require('bluebird'),
    fs = require('fs'),
    path = require('path'),
    FileQueue = require('filequeue'),
    urlencode = require('urlencode');

var fq = new FileQueue(100);
var csvData = "Fullname,EMail,GHUsername,Street,City,State,Zip,Country";

var START_INDEX = 27;

function quote(str) {
    return "\"" + str + "\"";
}

function githubName(str) {
    return str.substring(9, str.length - 1);
}

function convertPDF2CSV(directoryWithPDFJSON) {
    var deferred = Promise.defer();

    fq.readdir(directoryWithPDFJSON, function (err, files) {
        files.forEach(function (file, index) {
            var fullPath = path.join(directoryWithPDFJSON, file);
            fq.readFile(fullPath, function (err, data) {
                var pdfJson = JSON.parse(data),
                    textLength = pdfJson.formImage.Pages[0].Texts.length;

                // everything below this amount of text seems to be broken
                if (textLength > 10) {
                    var pageZero    = pdfJson.formImage.Pages[0];
//                    if (textLength > 35) {
//                        console.log("Datei:", file, "Text Length:", textLength);
//                    }

                    var name        = urlencode.decode(pageZero.Texts[START_INDEX + 1].R[0].T).trim();
                    var ghusername  = githubName(urlencode.decode(pageZero.Texts[START_INDEX + 2].R[0].T).trim());
                    var email       = urlencode.decode(pageZero.Texts[START_INDEX + 3].R[0].T).trim();
                    
                    var street, stateAndZIP, country;

                    if (textLength === 35) {
                        street      = urlencode.decode(pageZero.Texts[START_INDEX + 4].R[0].T).trim() + urlencode.decode(pageZero.Texts[START_INDEX + 5].R[0].T).trim();
                        stateAndZIP = urlencode.decode(pageZero.Texts[START_INDEX + 6].R[0].T).trim();
                        country     = urlencode.decode(pageZero.Texts[START_INDEX + 7].R[0].T).trim();
                    } else if (textLength === 36) {
                        street      = urlencode.decode(pageZero.Texts[START_INDEX + 4].R[0].T).trim() + urlencode.decode(pageZero.Texts[START_INDEX + 5].R[0].T).trim() + urlencode.decode(pageZero.Texts[START_INDEX + 6].R[0].T).trim()
                        stateAndZIP = urlencode.decode(pageZero.Texts[START_INDEX + 7].R[0].T).trim();
                        country     = urlencode.decode(pageZero.Texts[START_INDEX + 8].R[0].T).trim();
                    } else {
                        street      = urlencode.decode(pageZero.Texts[START_INDEX + 4].R[0].T).trim();
                        stateAndZIP = urlencode.decode(pageZero.Texts[START_INDEX + 5].R[0].T).trim();
                        country     = urlencode.decode(pageZero.Texts[START_INDEX + 6].R[0].T).trim();
                    }
                    
                    var m = stateAndZIP.split(",");
                    var city = m[0].trim(),
                        zip = "",
                        state;
                    if (m.length === 2) {
                        // this is not the best solution, but it works for the majority...
                        stateAndZIP = m[1].split(" ");
                        state = stateAndZIP[1];
                        zip = stateAndZIP.slice(2, stateAndZIP.length);
                    }

                    csvData = csvData + "\n" + quote(name) + "," + quote(email) + "," + quote(ghusername) + "," + quote(street) + "," + quote(city) + "," + quote(state) + "," + quote(zip) + "," + quote(country);
                }

                if ((files.length - 1) === index) {
                    deferred.resolve();
                }
            });
        });
    });

    return deferred.promise;
}

convertPDF2CSV(process.argv[2]).then(function () {
    console.log(csvData);
});