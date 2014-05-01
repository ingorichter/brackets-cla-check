/*
 * Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, node: true, nomen: true,
 regexp: true, indent: 4, maxerr: 50 */

"use strict";

var GoogleSpreadsheet = require("google-spreadsheet"),
    fs                = require("fs"),
    Promise           = require('bluebird'),
    _                 = require('lodash'),
    path              = require('path');

var CONFIG_FILE = "../config/config.json";


function CLACheck() {
    this.config = JSON.parse(fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8'));
    this.my_sheet = new GoogleSpreadsheet(this.config["spreadsheet-id"]);
}

CLACheck.prototype.check = function (githubusername) {
    var deferred = Promise.defer();

    var self = this;

    this.my_sheet.setAuth(this.config["google.username"], this.config["google.password"], function (err) {
    // without auth -- read only
    // # is worksheet id - IDs start at 1
        self.my_sheet.getInfo(function (err, ss_info) {
            if (err) {
                console.log(err);
                
                deferred.reject(err);
                return;
            }

        //    console.log(ss_info);
        //    console.log(ss_info.title + ' is loaded');
            // you can use the worksheet objects to add or read rows
            ss_info.worksheets[0].getRows(function (err, rows) {
                var index = _.find(rows, function (r) {
                    return r.githubusername === githubusername;
                });

                if (index === undefined || index === -1) {
                    deferred.reject();
                } else {
                    deferred.resolve();
                }
            });
        });
    });
    
    return deferred.promise;
};

module.exports = CLACheck;