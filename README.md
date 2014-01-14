historymod
==========

This repository houses the historymod module used in the 2st release of the
FI-WARE live demo.

This module is implemented using Node.js and the ngsijs Javascript library.

Configuration and installation
-------------

In the configuration file "historymod.config" should edit the configuration
fields required for the application:

e.g:

    // mysql DB config
    GLOBAL.DB_USER = 'mysql_user';
    GLOBAL.DB_PASSWORD = 'mysql_user_pass';
    GLOBAL.DB_NAME = 'mysql_database_name';

    // Service config
    //GLOBAL.SERVICE_URL = null; // Auto detect
    GLOBAL.SERVICE_URL = 'http://138.4.249.251';
    GLOBAL.SERVICE_PORT = '80';

    // NGSI SERVER
    GLOBAL.NGSI_URL = 'http://130.206.82.140:1026';

You must also install the dependencies in the local node_modules folder:

    $ npm install

In global mode (ie, with -g or --global appended to the command), it installs
the current package context as a global package.


Data Base Configuration
-----------------------

To configure the database that stores historical information, we need to have
installed mysql.

After you install mysql, you must create an empty database. For example, you
can create a new database from mysql command line:

    mysql> CREATE DATABASE database_name;

Then, import database from historymod.sql file:

    $ mysql -u db_user -p database_name < path_to_historymod.sql;

Running
-------

    $ npm run start

Contact
-------

For any question, bug report, suggestion or feedback in general, please contact
with Álvaro Arranz (aarranz at conwet dot com).

License
-------

This code is licensed under GNU Affero General Public License v3 with linking
exception. You can find the license text in the LICENSE file in the repository
root.
