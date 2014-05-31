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
/*global require, module, __dirname */
"use strict";

var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path');

var CLAChecker = require('../lib/CLACheck');
var CONFIG_FILE = "../config/config.json";

var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, CONFIG_FILE), 'utf8'));

var claChecker = new CLAChecker();

function checkGithubUsername(username) {
    return claChecker.check(username);
}

/* GET */
router.get('/check/:username', function (req, res) {
    if (req.params.username && req.get("Content-Type") === "application/json") {
        checkGithubUsername(req.params.username).then(function () {
            res.json({checkSuccessful: true, username: req.params.username});
        }, function () {
            res.json({checkSuccessful: false, username: req.params.username});
        });
    } else {
        res.json({});
    }
});

router.get('/check', function (req, res) {
    res.render('clacheck', { title: 'Express' });
});

/* Redirect to google docs */
router.get('/sign', function (req, res) {
    res.redirect(301, 'https://docs.google.com/forms/d/' + config["spreadsheet-id"] + '/viewform');
});

/* Called from Form */
router.post('/checksigned', function (req, res) {
    checkGithubUsername(req.body.contributor).then(function () {
        res.render('clacheck', {checkSuccessful: true});
    }, function () {
        res.render('clacheck', {checkSuccessful: false, checkFailed: true});
    });
});

module.exports = router;