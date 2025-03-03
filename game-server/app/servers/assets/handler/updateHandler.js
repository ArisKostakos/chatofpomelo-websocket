var fs = require('fs-extra');
var path = require('path');
var database = require('../../../modules/database');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;


handler.addProjectMainModuleAssetReferences = function(msg, session, next) {
    var self = this;
    var sessionService = self.app.get('sessionService');

    //Session bindings
    var user = session.get('user');
    var developer = session.get('developer');
    var project = session.get('project');

    var assetReferences = msg.assetReferences;

    database.findOne(database.Module, {_id: project.moduleMain},
        function (err, module_found) {
            //Handle Error
            if (err) {
                next(null, {code: "error"});
                return console.error(err);
            }

            console.warn("MAIN MODULE ASSETS: " + module_found.assets);
            console.warn("ASSET REFERENCES: " + assetReferences);

            //For each assetRef to add
            for (var i=0; i<assetReferences.length; i++)
            {
                var notFound=false;

                //For each assetRef to add
                for (var j=0; j<module_found.assets.length; j++)
                {
                    if (assetReferences[i]==module_found.assets[j])
                    {
                        notFound=true;
                        break;
                    }
                }

                if (notFound==false)
                {
                    console.warn("Adding: " + assetReferences[i]);
                    module_found.assets.push(assetReferences[i]);
                }
                else
                {
                    console.warn("Asset Already exists. Doing Nothing: " + assetReferences[i]);
                }
            }

            module_found.markModified('assets');
            module_found.save(function (err) {
                //Handle Error
                if (err) {
                    next(null, {code: "error"});
                    return console.error(err);
                }

                //Handle Success
                next(null, {code: "success"});
            });
        }
    );
};

handler.removeProjectMainModuleAssetReferences = function(msg, session, next) {
    var self = this;
    var sessionService = self.app.get('sessionService');

    //Session bindings
    var user = session.get('user');
    var developer = session.get('developer');
    var project = session.get('project');

    var assetReferences = msg.assetReferences;

    database.findOne(database.Module, {_id: project.moduleMain},
        function (err, module_found) {
            //Handle Error
            if (err) {
                next(null, {code: "error"});
                return console.error(err);
            }

            console.warn("MAIN MODULE ASSETS: " + module_found.assets);
            console.warn("ASSET REFERENCES: " + assetReferences);

            //For each assetRef to remove
            for (var i=0; i<assetReferences.length; i++)
            {
                // Find and remove item from an array
                var indexFound = module_found.assets.indexOf(assetReferences[i]);
                if(indexFound != -1) {
                    module_found.assets.splice(indexFound, 1);
                    console.warn("Removing Reference: " + assetReferences[i]);
                }
                else
                {
                    console.warn("(WARNING!) Asset does not exist. Doing Nothing: " + assetReferences[i]);
                }
            }

            module_found.markModified('assets');
            module_found.save(function (err) {
                //Handle Error
                if (err) {
                    next(null, {code: "error"});
                    return console.error(err);
                }

                //Handle Success
                next(null, {code: "success"});
            });
        }
    );
};

handler.updateAssetEntry = function(msg, session, next) {
    var self = this;
    var sessionService = self.app.get('sessionService');

    database.findOne(database.Asset, {_id: msg.assetId},
        function (err, asset_found) {
            //Handle Error
            if (err) {
                next(null, {code: "error"});
                return console.error(err);
            }

            //Reflect this??
            if (msg.field=="tags")
                asset_found.tags=msg.newValue;
            else if (msg.field=="title")
                asset_found.title=msg.newValue;

            asset_found.markModified(msg.field);
            asset_found.save(function (err) {
                //Handle Error
                if (err) {
                    next(null, {code: "error"});
                    return console.error(err);
                }

                //Handle Success
                next(null, {code: "success"});
            });
        }
    );
};