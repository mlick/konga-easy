/**
 * Created by user on 06/10/2017.
 */
'use strict'


module.exports = function (next) {

    if(process.env.NODE_ENV == 'production') return next();

    switch (process.env.DB_ADAPTER) {
        case("postgres"):
            console.log("Using postgres...");
            return require("./dbs/pg").run(next);
        case("mysql"):
            console.log("Using mysql...");
            return require("./dbs/mysql").run(next);
        case("mongo"):
            console.log("Using mongo...");
            return next();
        case("sqlserver"):
            console.log("Using sqlserver...");
            return next();
        default:
            console.log("No DB Adapter defined. Using localDB...");
            return next();

    }
}




