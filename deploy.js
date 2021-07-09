const TARGET_BUCKET_NAME = "isun-frontend-deployment";
const DEPLOYMENT_JSON_NAME = "deployment.json";
const BUILD_DIR = "build";
const MAX_CACHE_DURATION_MS = 1000 * 60 * 60 * 24 * 31;
const BUILD_AND_DEPLOY_COMMAND = "npm run deploy";
const fs = require('fs');
const AWS = require('aws-sdk');
AWS.config.credentials = new AWS.SharedIniFileCredentials();
const S3 = new AWS.S3();
const mime = require('mime-types');
const prettyMs = require('pretty-ms');
const colors = require('colors');
const filesize = require('filesize');
const util = require('util');

console.warn("Using locally configured profile: " + AWS.config.credentials.profile);

checkBuildIsUpToDate();

function checkBuildIsUpToDate() {
    const stats = fs.statSync(BUILD_DIR + "/index.html");
    const mtime = new Date(util.inspect(stats.mtime));
    const minutesSinceBuild = Math.floor((new Date().getTime() - mtime.getTime()) / (1000 * 60));
    const maxMinutesSinceBuild = 1;
    if (minutesSinceBuild > maxMinutesSinceBuild) {
        console.log("The build is older than " + maxMinutesSinceBuild + "m: " + minutesSinceBuild + "m. Please run \"" + BUILD_AND_DEPLOY_COMMAND + "\" to perform build & deployment.");
        process.exit(1);
    }
    removeAllFilesExceptIndexHtmlAccordingToDeploymentJson();
}

function removeAllFilesExceptIndexHtmlAccordingToDeploymentJson() {
    S3.getObject({ Bucket: TARGET_BUCKET_NAME, Key: DEPLOYMENT_JSON_NAME }, function (err, data) {
        // Fetch deployment.json
        const fileDoesNotExist = err && err.code === 'NoSuchKey';
        let deploymentJson = false;
        if (fileDoesNotExist) {
            deploymentJson = false;
        } else {
            if (err) {
                console.error(("Error while downloading file '" + DEPLOYMENT_JSON_NAME + "' from bucket '" + TARGET_BUCKET_NAME + "'").red);
                throw err;
            } else {
                deploymentJson = JSON.parse(data.Body.toString('utf-8'));
            }
        }

        // Fetch all objects inside this bucket, excluding index.html and Deployment JSON
        if (deploymentJson === false) {
            uploadNewFilesExceptIndexHtml();
        } else {
            getObjectsInTargetBucketWithoutIndexHtmlAndDeploymentJson(function (objectsWithoutIndexHtml) {
                console.log(objectsWithoutIndexHtml.length + " objects in target bucket (without index.html and deployment.json)");

                // Filter items which might still be cached / in use
                const oldObjectsWithoutIndexHtml = [];
                const nowMs = new Date().getTime();
                for (let i = 0; i < objectsWithoutIndexHtml.length; i++) {
                    const ageMs = nowMs - new Date(objectsWithoutIndexHtml[i].LastModified).getTime();
                    if (ageMs >= MAX_CACHE_DURATION_MS) {
                        oldObjectsWithoutIndexHtml.push(objectsWithoutIndexHtml[i]);
                    }
                }
                console.log("Retaining " + (objectsWithoutIndexHtml.length - oldObjectsWithoutIndexHtml.length)
                    + " items - reason: newer than MAX_CACHE = '" + MAX_CACHE_DURATION_MS + "ms'");

                // Filter items which are part of the current release
                const oldNonReleasedKeysWithoutIndexHtml = [];
                const keysOfCurrentRelease = deploymentJson.keys;
                for (let i = 0; i < oldObjectsWithoutIndexHtml.length; i++) {
                    if (keysOfCurrentRelease.indexOf(oldObjectsWithoutIndexHtml[i].Key) === -1) {
                        oldNonReleasedKeysWithoutIndexHtml.push(oldObjectsWithoutIndexHtml[i].Key);
                    }
                }
                console.log("Retaining " + (oldObjectsWithoutIndexHtml.length - oldNonReleasedKeysWithoutIndexHtml.length)
                    + " items - reason: Part of the currently deployed release");

                // Remove obsolete files
                const removeObjectsByKeys = function (index, keys) {
                    console.log("Removing obsolete file: " + keys[index]);
                    S3.deleteObject({ Bucket: TARGET_BUCKET_NAME, Key: keys[index] }, function (err) {
                        if (err) {
                            console.error("Failed to delete object".red);
                            throw err;
                        } else {
                            index++;
                            if (index < keys.length) {
                                removeObjectsByKeys(index, keys);
                            } else {
                                console.log("Removed '" + index + "' obsolete files");

                                // Finally, remove deployment.json
                                S3.deleteObject({ Bucket: TARGET_BUCKET_NAME, Key: DEPLOYMENT_JSON_NAME }, function (err) {
                                    if (err && err.code !== 'NoSuchKey') {
                                        console.error("Failed to remove deployment.json".red);
                                        throw err;
                                    } else {
                                        uploadNewFilesExceptIndexHtml();
                                    }
                                });
                            }
                        }
                    });
                };
                if (oldNonReleasedKeysWithoutIndexHtml.length === 0) {
                    uploadNewFilesExceptIndexHtml();
                } else {
                    console.log("Removing obsolete files");
                    removeObjectsByKeys(0, oldNonReleasedKeysWithoutIndexHtml);
                }
            });
        }
    });
}

function uploadNewFilesExceptIndexHtml() {
    walk(BUILD_DIR, function (err, buildFiles) {
        if (err) {
            console.error(("Failed to get files in build directory '" + BUILD_DIR + "'!").red);
            throw err;
        } else {
            // Exclude index.html and other files that shall be excluded from deployment
            console.log("Found '" + buildFiles.length + "' files in build directory");
            const buildFilesFiltered = [];
            for (let i = 0; i < buildFiles.length; i++) {
                if (buildFiles[i] !== BUILD_DIR + '/index.html') {
                        buildFilesFiltered.push(buildFiles[i]);
                }
            }
            console.log("After applying filter, have '" + buildFilesFiltered.length + "' files for upload");

            // Upload files into bucket
            const deployedKeys = [];
            const uploadFiles = function (index, files) {
                const fileContent = fs.readFileSync(files[index]);
                if (fileContent === null) {
                    console.error(("Failed to read build file '" + files[index] + "'").red);
                    throw new Error("FS error");
                }
                const deployToKey = files[index].substr(BUILD_DIR.length + "/".length);
                let contentType = mime.lookup(deployToKey);
                const charset = mime.charset(contentType);
                if (charset) {
                    contentType += "; charset=" + charset.toLowerCase();
                }
                const cacheDurationSecs = 14400;
                const cacheControl = "public, max-age=" + cacheDurationSecs;
                printFileUploadAttempt(deployToKey, contentType, cacheControl, cacheDurationSecs, fs.statSync(files[index]).size);
                deployedKeys.push(deployToKey);
                S3.putObject({ Bucket: TARGET_BUCKET_NAME, Key: deployToKey, ContentType: contentType, Body: fileContent, CacheControl: cacheControl }, function(err) {
                    if (err) {
                        console.error("Failed to upload file to S3".red);
                        throw err;
                    } else {
                        index++;
                        if (index < files.length) {
                            uploadFiles(index, files);
                        } else {
                            console.log(index + " files successfully uploaded.");
                            uploadIndexHtml(deployedKeys);
                        }
                    }
                });
            };
            if (buildFilesFiltered.length === 0) {
                uploadIndexHtml(deployedKeys);
            } else {
                uploadFiles(0, buildFilesFiltered);
            }
        }
    });
}

function printFileUploadAttempt(key, contentType, cacheControl, cacheDurationSecs, fileSizeBytes) {
    console.log("Uploading file: " + key.cyan + " (" + filesize(fileSizeBytes) + ")"
        + " { Content-Type: " + contentType + ", Cache-Control: " + cacheControl + " (= " + prettyMs(cacheDurationSecs * 1000) + ") }");
}

function uploadIndexHtml(deployedKeys) {
    const key = "index.html";

    console.log("Committing files by uploading " + key);

    let contentType = mime.lookup(key);
    const charset = mime.charset(contentType);
    if (charset) {
        contentType += "; charset=" + charset.toLowerCase();
    }
    const cacheDurationSecs = 60;
    const cacheControl = "public, max-age=" + cacheDurationSecs;
    const indexHtmlPath = BUILD_DIR + '/' + key;
    printFileUploadAttempt(key, contentType, cacheControl, cacheDurationSecs, fs.statSync(indexHtmlPath).size);

    const fileContent = fs.readFileSync(indexHtmlPath);
    if (fileContent === null) {
        console.error(("Failed to read index.html at '" + indexHtmlPath + "'").red);
        throw new Error("FS error");
    }
    S3.putObject({ Bucket: TARGET_BUCKET_NAME, Key: key, ContentType: contentType, Body: fileContent, CacheControl: cacheControl }, function(err) {
        if (err) {
            console.error("Failed to upload index.html file to S3".red);
            throw err;
        } else {
            console.log(key + " successfully uploaded. Your release is " + "NOW LIVE".green + ": " + new Date().toString());
            uploadDeploymentJson(deployedKeys);
        }
    });
}

function uploadDeploymentJson(deployedKeys) {
    console.log("Creating Deployment JSON");

    S3.putObject({ Bucket: TARGET_BUCKET_NAME, Key: DEPLOYMENT_JSON_NAME, ContentType: "application/json", Body: JSON.stringify({ keys: deployedKeys }) }, function(err) {
        if (err) {
            console.error("Failed to upload deployment JSON to S3".red);
            throw err;
        } else {
            console.log("Deployment SUCCESS".green);
        }
    });
}

function walk(dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var i = 0;
        (function next() {
            var file = list[i++];
            if (!file) return done(null, results);
            file = dir + '/' + file;
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        next();
                    });
                } else {
                    results.push(file);
                    next();
                }
            });
        })();
    });
}

function getObjectsInTargetBucketWithoutIndexHtmlAndDeploymentJson(cb) {
    s3ListObjects({ Bucket: TARGET_BUCKET_NAME }, cb, ["index.html", DEPLOYMENT_JSON_NAME]);
}

function s3ListObjects(params, cb, filter, objectArray) {
    if (typeof filter === 'undefined') {
        filter = [];
    }
    if (typeof objectArray === 'undefined') {
        objectArray = [];
    }
    S3.listObjects(params, function (err, data) {
        if (err) {
            console.error("Error listing all objects in S3 bucket".red);
            throw err;
        } else {
            const objects = data.Contents;
            for (let i = 0; i < objects.length; i++) {
                const object = objects[i];
                if (filter.indexOf(object.Key) === -1) {
                    objectArray.push(object);
                }
            }
            if (data.IsTruncated) {
                // Set Marker to last returned key
                params.Marker = objects[objects.length - 1].Key;
                s3ListObjects(params, cb, filter, objectArray);
            } else {
                cb(objectArray);
            }
        }
    });
}
