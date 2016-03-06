import minimatch = require("minimatch");
import path = require("path");
import glob = require("glob");

import IProjectionLoader from "./IProjectionLoader";
import IProjectionResolver from "./IProjectionResolver";

export class ProjectionResolver implements IProjectionResolver {

    private _projectionLoader: IProjectionLoader;

    constructor(projectionLoader: IProjectionLoader) {
        this._projectionLoader = projectionLoader;
    }

    public getAlternate(file: string): string {
        var workingDirectory = path.dirname(file);

        var projections = this._projectionLoader.getProjections(workingDirectory);

        for(var i = 0; i < projections.length; i++) { 
            var projection = projections[i];
            
            var basePath = projection.basePath;
            var alternates = projection.alternates;

            for(var j = 0; j < alternates.length; j++) {
                var globPath = path.join(basePath, "/**/", alternates[j].primaryFilePattern);

                if(minimatch(file, globPath)) {
                    // Try and finding matching string


                    var alternate = this._findAlternate(file, path.join(basePath, "/**/", alternates[j].alternateFilePattern));
                    if(alternate)
                        return alternate;
                }
            }
        }

        return null;
    }

    private _findAlternate(filePath, alternateGlobPath: string): string {
        // Replace '{}' with the filename
        var fileNameWithoutExtension = path.basename(filePath, path.extname(filePath));

        alternateGlobPath = alternateGlobPath.replace("{}", fileNameWithoutExtension);

        var matches = glob.sync(alternateGlobPath);

        if(matches.length > 0)
            return matches[0];

        return null;
    }
}