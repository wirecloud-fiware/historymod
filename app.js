/*
 *     (C) Copyright 2013 CoNWeT Lab - Universidad Politécnica de Madrid
 *
 *     This file is part of Historymod.
 *
 *     Historymod is free software: you can redistribute it and/or modify it
 *     under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or (at
 *     your option) any later version.
 *
 *     Historymod is distributed in the hope that it will be useful, but
 *     WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero
 *     General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with History-Module. If not, see <http://www.gnu.org/licenses/>.
 *
 *     Linking this library statically or dynamically with other modules is
 *     making a combined work based on this library.  Thus, the terms and
 *     conditions of the GNU Affero General Public License cover the whole
 *     combination.
 *
 *     As a special exception, the copyright holders of this library give you
 *     permission to link this library with independent modules to produce an
 *     executable, regardless of the license terms of these independent
 *     modules, and to copy and distribute the resulting executable under
 *     terms of your choice, provided that you also meet, for each linked
 *     independent module, the terms and conditions of the license of that
 *     module.  An independent module is a module which is not derived from
 *     or based on this library.  If you modify this library, you may extend
 *     this exception to your version of the library, but you are not
 *     obligated to do so.  If you do not wish to do so, delete this
 *     exception statement from your version.
 *
 */

/**
 * Module dependencies.
 */

// main service config
var express = require('express');
var mysql = require('mysql');

// mysql DB config
var mysqlConnection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'fiw4r3',
    database : 'historyMod',
});
mysqlConnection.connect();
mysqlConnection.setMaxListeners(0);

// NGSI config
var xmldom = require('xmldom');
var xpath = require('xpath');
var http = require('http');
var node_url = require('url');

GLOBAL.DOMParser = xmldom.DOMParser;
GLOBAL.DOMImplementation = xmldom.DOMImplementation;
GLOBAL.XMLSerializer = xmldom.XMLSerializer;
GLOBAL.XPathResult = xpath.XPathResult;
GLOBAL.subscriptionId = null;

var _old_createDocument = xmldom.DOMImplementation.prototype.createDocument;

xmldom.DOMImplementation.prototype.createDocument = function () {
    var doc = _old_createDocument.apply(this, arguments);

	doc.evaluate = function(e, cn, r, t, res) {
        return xpath.evaluate(e, cn, r, t, res);
	};

    return doc;
}

var NGSI = require('./NGSI_lib/NGSI');
var logic = require('./logic');

var makeRequest = function makeRequest(url, options) {
    var parsed_url = node_url.parse(url);

    if (options.requestHeaders == null || typeof options.requestHeaders !== 'object') {
        options.requestHeaders = {};
    }
    options.requestHeaders['Content-Type'] = 'application/xml'
    options.requestHeaders['Accept'] = 'application/xml'
    options.requestHeaders['Content-Length'] = options.postBody.length;
    
    var request = http.request({
            method: options.method,
            hostname: parsed_url.hostname,
            port: parsed_url.port,
            path: parsed_url.path,
            headers: options.requestHeaders,
        }, function(response) {
            response.setEncoding('utf8');
            buf = '';
            response.on('data', function (chunck) { buf += chunck; });
            response.on('end', function () {
                try {
                    if ((response.statusCode >= 200 && response.statusCode < 300) && (typeof options.onSuccess === 'function')) {
                        options.onSuccess({responseText: buf});
                    }
                } catch (e) {
                    console.log("exception onSuccess!!!--> " + e.message);
                }
                if (typeof options.onComplete === 'function') {
                    options.onComplete();
                }
            });
        });

    request.on('error', function (e) {
        console.log(e.message);
        try {
            if (typeof options.onFailure === 'function') {
                options.onFailure({});
            }
        } catch (e) {
            onsole.log("exception onFailure!!!--> " + e.message);
        }
        if (typeof options.onComplete === 'function') {
            options.onComplete();
        }
    });

    if (options.postBody != null) {
        request.write(options.postBody);
    }
    request.end();
};

//shut down function
var gracefullyShuttinDown = function gracefullyShuttinDown() {
    console.log('Shut down signal Received ');
    if (subscriptionId != null) {
        connection.cancelSubscription(subscriptionId, {
            onComplete: function () {
                console.log('Exiting after unsubscribe');
                process.exit(0);
            }
        });

        setTimeout(function () {
            console.log('Force exiting after 30 seconds.');
            process.exit(0);
        }, 30000);
    } else {
        console.log('Exiting...');
        process.exit(0);
    }

};

// Context Broker
var ngsi_server = 'http://130.206.82.140:1026/';
var connection = new NGSI.Connection(ngsi_server, {requestFunction: makeRequest});
logic.setNGSIConnection(connection);

process.on('SIGINT', gracefullyShuttinDown);
process.on('SIGTERM',gracefullyShuttinDown);


// Server
var app = express();

app.configure(function() {
    app.use(express.bodyParser());
});

app.configure('development', function(){
    app.use(express.errorHandler());
});

app.options('/*', logic.options);
app.get('/lamps', logic.getAll.bind(null, mysqlConnection, "Nodes"));
app.get('/amms', logic.getAll.bind(null, mysqlConnection, "AMMS"));
app.get('/regulators', logic.getAll.bind(null, mysqlConnection, "Regulator"));

app.get('/lamps/count', logic.countOfElements.bind(null, mysqlConnection, "Nodes"));
app.get('/amms/count', logic.countOfElements.bind(null, mysqlConnection, "AMMS"));
app.get('/regulators/count', logic.countOfElements.bind(null, mysqlConnection, "Regulator"));

app.get('/lamps/:id', logic.getEntity.bind(null, mysqlConnection, "Nodes"));
app.get('/amms/:id', logic.getEntity.bind(null, mysqlConnection, "AMMS"));
app.get('/regulators/:id', logic.getEntity.bind(null, mysqlConnection, "Regulator"));

app.get('/last/lamps/:id', logic.getLast.bind(null, mysqlConnection, "Nodes"));
app.get('/last/amms/:id', logic.getLast.bind(null, mysqlConnection, "AMMS"));
app.get('/last/regulators/:id', logic.getLast.bind(null, mysqlConnection, "Regulator"));

app.get('/lamps/between/:from/:to', logic.getAllBetween.bind(null, mysqlConnection, "Nodes"));
app.get('/amms/between/:from/:to', logic.getAllBetween.bind(null, mysqlConnection, "AMMS"));
app.get('/regulators/between/:from/:to', logic.getAllBetween.bind(null, mysqlConnection, "Regulator"));

app.get('/lamps/between/:id/:from/:to', logic.getBetween.bind(null, mysqlConnection, "Nodes"));
app.get('/amms/between/:id/:from/:to', logic.getBetween.bind(null, mysqlConnection, "AMMS"));
app.get('/regulators/between/:id/:from/:to', logic.getBetween.bind(null, mysqlConnection, "Regulator"));

app.post('/notify', logic.NotifyChanges.bind(null, mysqlConnection));

// start service
app.listen(80);
console.log('Listening on port 80...');


var subscribeNGSI = function subscribeNGSI() {
    console.log('Creating subscription to sensor changes...');
    console.log('A-app.listeners(): ' + app.listeners());
    connection.createSubscription([{
                type: 'Node',
                isPattern: true,
                id: 'OUTSMART\..*'
            }, {
                type: 'AMMS',
                isPattern: true,
                id: 'OUTSMART\..*'
            }, {
                type: 'Regulator',
                isPattern: true,
                id: 'OUTSMART\..*'
            }
        ],
        null,
        'P1Y',
        null,
        [{type:'ONCHANGE', condValues: ['TimeInstant']}],
        {
            flat: true,
            onSuccess: function (data) {
                subscriptionId = data.subscriptionId;
                console.log('New subscription created: ' + subscriptionId);
                console.log('B-app.listeners(): ' + app.listeners());
            },
            onFailure: function () {
                //
            },
            onNotify: 'http://130.206.82.141:80/notify' // will call logic.NotifyChanges
        }
    );
};

var refreshNGSISubscription = function refreshNGSISubscription() {
    connection.updateSubscription(subscriptionId,
        'PT24H',
        null,
        [{type:'ONCHANGE', condValues: ['TimeInstant']}],
        {
            onComplete: function () {
                console.log('NGSI Subscription updated');
            },
            onFailure: function () {
                console.log('Error updating NGSI Subscription.');
            }
    });
};

var processAMMSObs = function processAMMSObs(obsList) {
    console.log("- Getting AMMS. Number of capture: " + namms);
    logic.addAMMSInGroup(obsList, mysqlConnection);
};

var processRegulatorObs = function processRegulatorObs(obsList) {
    console.log("- Getting Regulators. Number of capture: " + nregs);
    logic.addRegulatorInGroup(obsList, mysqlConnection);
};

var errorHandlerAMMS = function errorHandlerAMMS() {
    errorHandler('AMMS');
}

var errorHandlerLamp = function errorHandlerLamp() {
    errorHandler('Lamp');
}

var errorHandlerReg = function errorHandlerReg() {
    errorHandler('Regulator');
}

var errorHandler = function errorHandler(entityType) {
    console.log('*-*-*-* ERROR in ngsi query getting ' + entityType + '\n');
}

var completeHandlerAMMS = function completeHandlerAMMS() {
    completeHandler('AMMS');
}

var completeHandlerLamp = function completeHandlerLamp() {
    completeHandler('Lamp');
}

var completeHandlerReg = function completeHandlerReg() {
    completeHandler('Regulator');
}

var completeHandler = function completeHandler(entityType) {
    console.log('* ngsi query COMPLETED getting ' + entityType);
}


// MAIN CALLS
subscribeNGSI();
