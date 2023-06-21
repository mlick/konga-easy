/**
 * Created by user on 06/10/2017.
 */

'use strict'

var mysql = require("../../node_modules/sails-mysql/node_modules/mysql");
var dbConf = require("../../config/connections");
var URL = require('url');
var _ = require('lodash');


function parse(uri) {

    var parsed =  URL.parse(uri);

    return {
        user: parsed.auth.split(":")[0],
        password: parsed.auth.split(":")[1] || null,
        host: parsed.hostname,
        port: parsed.port,
        database: parsed.pathname.replace('/', '')
    }
}

module.exports = {
    run : function (next) {
        console.log("Using MySQL DB Adapter.");
        return this.create(next);
    },


    sqlExe : function(connection, statement, error) {
        connection.query(statement, function (error, results, fields) {
            if (error) {
                console.error(error);
                error = true
            }
        });
    },

    getConnection : function() {
        var parsedOpts;
        var url = dbConf.connections.mysql.url;
        if(url) {
          parsedOpts = parse(url);
        }


        var connection = mysql.createConnection(url ? _.omit(parsedOpts,['database']) : {
            host     : dbConf.connections.mysql.host,
            port     : dbConf.connections.mysql.port,
            user     : dbConf.connections.mysql.user,
            password : dbConf.connections.mysql.password
        });

        connection.connect(function(err) {
            if(err) {
                setTimeout('this.getConnection()', 2000);
            }
        });

        connection.on('error', function(err) {
            console.error(err);
            if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                console.log('db reconnect.');
                this.getConnection();
            } else {
                throw err;
            }
        });
        return connection;
    },

    create : function(next) {

        var parsedOpts;
        var url = dbConf.connections.mysql.url;
        var region = dbConf.connections.mysql.region;
        if(url) {
            parsedOpts = parse(url);
        }

        var connection = this.getConnection()

        var db = ( parsedOpts ? parsedOpts.database : dbConf.connections.mysql.database )

        console.log("Creating database `" + db + "` if not exists.");

        connection.query('CREATE DATABASE IF NOT EXISTS ' + db, function (error, results, fields) {
            if (error) {
                console.error(error);
                return next(error);
            }
        });

        console.log("Creating tables and init data if not exists.");

        var err = false;
        this.sqlExe(connection, "use " + db, err);
        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_api_health_checks` (`id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `api_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `api` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `health_check_endpoint` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `notification_endpoint` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `active` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `data` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE,\n" +
            "  UNIQUE INDEX `api_id`(`api_id`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err);
        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_email_transports`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `description` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `schema` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `settings` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `active` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE,\n" +
            "  UNIQUE INDEX `name`(`name`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err);
        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_kong_nodes`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `type` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `kong_admin_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `netdata_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `kong_api_key` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `jwt_algorithm` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `jwt_key` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `jwt_secret` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `kong_version` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `health_checks` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `health_check_details` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `active` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err)
        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_kong_services`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `service_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `kong_node_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `description` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `tags` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE,\n" +
            "  UNIQUE INDEX `service_id`(`service_id`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err);

        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_kong_snapshot_schedules`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `connection` int(11) NULL DEFAULT NULL,\n" +
            "  `active` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `cron` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `lastRunAt` date NULL DEFAULT NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err)
        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_kong_snapshots`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `kong_node_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `kong_node_url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `kong_version` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `data` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE,\n" +
            "  UNIQUE INDEX `name`(`name`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 21 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err)

        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_kong_upstream_alerts`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `upstream_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `connection` int(11) NULL DEFAULT NULL,\n" +
            "  `email` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `slack` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `cron` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `active` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `data` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE,\n" +
            "  UNIQUE INDEX `upstream_id`(`upstream_id`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err)

        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_netdata_connections`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `apiId` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `url` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err)
        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_passports`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `protocol` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `provider` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `identifier` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `tokens` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `user` int(11) NULL DEFAULT NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err)
        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_settings`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `data` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err)

        this.sqlExe(connection, "CREATE TABLE IF NOT EXISTS `konga_users`  (\n" +
            "  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,\n" +
            "  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `email` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `firstName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `lastName` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `admin` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `node_id` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `active` tinyint(1) NULL DEFAULT NULL,\n" +
            "  `activationToken` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,\n" +
            "  `node` int(11) NULL DEFAULT NULL,\n" +
            "  `createdAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `updatedAt` datetime(0) NULL DEFAULT NULL,\n" +
            "  `createdUserId` int(11) NULL DEFAULT NULL,\n" +
            "  `updatedUserId` int(11) NULL DEFAULT NULL,\n" +
            "  PRIMARY KEY (`id`) USING BTREE,\n" +
            "  UNIQUE INDEX `username`(`username`) USING BTREE,\n" +
            "  UNIQUE INDEX `email`(`email`) USING BTREE\n" +
            ") ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic", err)

        if (err) {
            return next("sql exe error");
        }
        return next();
    }
}