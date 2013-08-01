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

var NGSI = require('./NGSI_lib/NGSI');

var isEmpty = function isEmpty(obj) {
    for(var key in obj) {
        return false;
    }
    return true;
};

var NGSIConnection = null;

exports.setNGSIConnection = function setNGSIConnection(connection){
    NGSIConnection = connection;
}

var idMap = {
    'Nodes': 'lampId',
    'AMMS': 'ammsId',
    'Regulator': 'regId'
};

exports.options = function options(req, res) {

    var origin = req.header('Origin');
    if (origin != null) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    }
    res.send(204);
};

// get methods
exports.getAll = function getAll(mysqlConnection, table, req, res) {
    console.log('****get all ' + table);

    var origin = req.header('Origin');
    if (origin != null) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    mysqlConnection.query('SELECT * FROM ??', [table], function(err, results, fields) {
        if (err) {
            throw err;
        }
        res.send(results);
    });
};

exports.getEntity = function getEntity(mysqlConnection, table, req, res) {
    console.log('**** get ' + req.params.id);

    var origin = req.header('Origin');
    if (origin != null) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    mysqlConnection.query('SELECT * FROM ?? WHERE ?? = ? ORDER BY timeInstant ASC', [table, idMap[table], req.params.id], function(err, results, fields) {
        if (err) {
            throw err;
        }
        res.send(results);
    });
};



exports.getLast = function getLast(mysqlConnection, table, req, res) {
    console.log('****get last lamp: ' + req.params.id);

    var origin = req.header('Origin');
    if (origin != null) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    mysqlConnection.query('SELECT * FROM ?? WHERE ?? = ? ORDER BY timeInstant DESC LIMIT 0, 1', [table, idMap[table], req.params.id], function(err, results, fields) {
        if (err) {
            throw err;
        }
        res.send(results);
    });
};

exports.getAllBetween = function getAllBetween(mysqlConnection, table, req, res) {
    console.log('**** get all' + table + ' between ' + req.params.from + ' and ' + req.params.to);

    var query = "SELECT * FROM lamps WHERE timeInstant >= '" + req.params.from + "' AND timeInstant <= '" + req.params.to + "' ORDER BY timeInstant ASC";

    var origin = req.header('Origin');
    if (origin != null) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    mysqlConnection.query("SELECT * FROM ?? WHERE timeInstant >= ? AND timeInstant <= ? ORDER BY timeInstant ASC", [table, parseInt(req.params.from, 10), parseInt(req.params.to, 10)], function(err, results, fields) {
        if (err) {
            throw err;
        }
        res.send(results);
    });
};

exports.getBetween = function getBetween(mysqlConnection, table, req, res) {
    console.log('**** get '+ req.params.id + ' in ' + table + ' between ' + req.params.from + ' and ' + req.params.to);

    var query = "SELECT * FROM lamps WHERE lamp = '" + req.params.id + "' AND timeInstant >= '" + req.params.from + "' AND timeInstant <= '" + req.params.to + "' ORDER BY timeInstant ASC";
    console.log(query);

    var origin = req.header('Origin');
    if (origin != null) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    mysqlConnection.query("SELECT * FROM ?? WHERE ?? = ? AND timeInstant >= ? AND timeInstant <= ? ORDER BY timeInstant ASC", [table, idMap[table], req.params.id, parseInt(req.params.from, 10), parseInt(req.params.to, 10)], function(err, results, fields) {
        if (err) {
            throw err;
        }
        res.send(results);
    });
};


// add methods
exports.addLamp = function addLamp(data, connection) {
    console.log("Starting addLamp: ");
    var value = "('', " + connection.escape(data.id) + ", " + connection.escape(data.presence) + "," + connection.escape(data.batteryCharge) + "," + connection.escape(data.illuminance) + "," + connection.escape(data.TimeInstant) + ")";
    console.log(value);

    if (data.TimeInstant != '') {
        stamp = connection.escape(new Date(data.TimeInstant).getTime());

        connection.query("INSERT INTO Nodes (`id`, `lampId`, `presence`, `batteryCharge`, `illuminance`, `timeInstant`) VALUES ('', ?, ?, ?, ?, ?)", [data.id, data.presence, data.batteryCharge, data.illuminance, stamp] , function(err, results, fields) {
            if (err) {
                console.log("Error in addLamp query" + data + "-->" + err);
            } else {
                console.log('+ New Node values added for: ' + data.id);
            }
        });
    } else {
        // discarding lamp without timestamp
        console.log('- Discarding Node without timestamp' + value);
    }
};

exports.addAMMS = function addAMMS(data, connection) {

    console.log("Starting addAMMS: ");
    var value = "('', " + connection.escape(data.id) + ", " + connection.escape(data.presence) + "," + connection.escape(data.batteryCharge) + "," + connection.escape(data.illuminance) + "," + connection.escape(data.TimeInstant) + ")";
    console.log(value);

    if (data.TimeInstant != '') {
        stamp = connection.escape(new Date(data.TimeInstant).getTime());

        connection.query("INSERT INTO AMMS (`id`, `ammsId`, `activePower`, `reactivePower`, `timeInstant`) VALUES  ('', ?, ?, ?, ?)", [data.id, data.ActivePower, data.ActivePower, stamp] , function(err, results, fields) {
            if (err) {
                console.log("Error in addAMMS query" + data + "-->" + err);
            } else {
                console.log('+ New AMMS values added for: ' + data.id);
            }
        });
    } else {
        // discarding AMMS without timestamp
        console.log('- Discarding AMMS without timestamp' + value);
    }
};

exports.addRG = function addRG(data, connection) {

    console.log("Starting addRG: ");
    var value = "('', " + connection.escape(data.id) + ", " + connection.escape(data.presence) + "," + connection.escape(data.batteryCharge) + "," + connection.escape(data.illuminance) + "," + connection.escape(data.TimeInstant) + ")";
    console.log(value);

    if (data.TimeInstant != '') {
        stamp = connection.escape(new Date(data.TimeInstant).getTime());

        connection.query("INSERT INTO Regulator (`id`, `regId`, `activePower`, `reactivePower`, `electricPotential`, `electricCurrent`, `timeInstant`) VALUES ('', ?, ?, ?, ?, ?, ?)", [data.id, data.ActivePower, data.ReactivePower, data.electricPotential, data.electricCurrent, stamp] , function(err, results, fields) {
            if (err) {
                console.log("Error in addRG query" + data + "-->" + err);
            } else {
                console.log('+ New Regulator values added for: ' + data.id);
            }
        });
    } else {
        // discarding Regulator without timestamp
        console.log('- Discarding Regulator without timestamp' + value);
    }
};

exports.NotifyChanges = function NotifyChanges(mysqlConnection, req, res) {

    console.log('New Notify Recived');
    try {
        var buf = '';
        req.on('data', function (chunck) { buf += chunck; });
        req.on('end', function () {

            var doc = NGSI.XML.parseFromString(buf, 'application/xml');
            var data = NGSI.parseNotifyContextRequest(doc, {flat: true});

            if (subscriptionId !== null && data.subscriptionId !== subscriptionId) {
                // cancel old subscriptions
                NGSIConnection.cancelSubscription(data.subscriptionId);
                console.log('Old subscription canceled: ' + data.subscriptionId);
                return;
            }

            var sensors = data.elements;
            for (var sensor_id in sensors) {
                var sensor = sensors[sensor_id];
                 if (sensor.type === 'Node') {
                    exports.addLamp(sensor, mysqlConnection);
                } else if (sensor.type === 'AMMS') {
                    exports.addAMMS(sensor, mysqlConnection);
                } else if (sensor.type === 'Regulator') {
                    exports.addRG(sensor, mysqlConnection);
                }
            }
        });
    } catch(e) {
        console.log('Exception in NotifyChanges:' + e.message);
    }
    console.log('Exit New Notify handler');
};

exports.countOfElements = function countOfElements (mysqlConnection, table, req, res) {
    var numberOfLights;

    console.log('****get conunt of ' + table);

    var origin = req.header('Origin');
    if (origin != null) {
        res.header('Access-Control-Allow-Origin', origin);
    }

    mysqlConnection.query('SELECT ??, COUNT(*) FROM ?? GROUP BY ??', [idMap[table], table, idMap[table]], function(err, results, fields) {
        if (err) {
            throw err;
        }
        res.send(results);
        console.log(results);
        numberOfLights = results.length;
        console.log('Number of Lights: ' + numberOfLights);
    });
};
