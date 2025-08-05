// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

function handler(event) {
    var request = event.request;
    var originalImagePath = request.uri;
    //  validate, process and normalize the requested operations in query parameters
    var normalizedOperations = {};
    if (request.querystring) {
        Object.keys(request.querystring).forEach(operation => {
            switch (operation.toLowerCase()) {
                case 'format': 
                    var SUPPORTED_FORMATS = ['auto', 'jpeg', 'webp'];
                    if (request.querystring[operation]['value'] && SUPPORTED_FORMATS.includes(request.querystring[operation]['value'].toLowerCase())) {
                        var format = request.querystring[operation]['value'].toLowerCase(); // normalize to lowercase
                        if (format === 'auto') {
                            format = 'jpeg';
                            if (request.headers['accept']) {
                                if (request.headers['accept'].value.includes("webp")) {
                                    format = 'webp';
                                } 
                            }
                        }
                        normalizedOperations['format'] = format;
                    }
                    break;
                case 'width':
                    var SUPPORTED_WIDTH = [160, 196, 256, 384, 428, 640, 750, 828, 1080, 1200, 1920];
                    if (request.querystring[operation]['value'] && SUPPORTED_WIDTH.includes(parseInt(request.querystring[operation]['value']))) {
                        normalizedOperations['width'] = request.querystring[operation]['value'];
                    }
                    break;
                default: break;
            }
        });
        //rewrite the path to normalized version if valid operations are found
        if (Object.keys(normalizedOperations).length > 0) {
            // put them in order
            var normalizedOperationsArray = [];
            if (normalizedOperations.format) normalizedOperationsArray.push('format='+normalizedOperations.format);
            if (normalizedOperations.width) normalizedOperationsArray.push('width='+normalizedOperations.width);
            request.uri = originalImagePath + '/' + normalizedOperationsArray.join(',');     
        } else {
            // If no valid operation is found, flag the request with /original path suffix
            request.uri = originalImagePath + '/original';     
        }

    } else {
        // If no query strings are found, flag the request with /original path suffix
        request.uri = originalImagePath + '/original';
    }
    // remove query strings
    request['querystring'] = {};
    return request;
}
