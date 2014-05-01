/*global require, module */
"use strict";

var express = require('express');
var router = express.Router();

var CLAChecker = require('../lib/CLACheck');

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
    res.redirect(301, 'https://docs.google.com/forms/d/11jMpMWO5ilVJ82zuTzKyubRld11WkFC3gmhSLLVd6QE/viewform');
});

router.post('/checksigned', function (req, res) {
    checkGithubUsername(req.body.contributor).then(function () {
        res.render('clacheck', {checkSuccessful: true});
    }, function () {
        res.render('clacheck', {checkSuccessful: false, checkFailed: true});
    });
});

module.exports = router;
