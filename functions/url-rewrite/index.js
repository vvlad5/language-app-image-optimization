// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

function handler(event) {
    const request = event.request;
    const originalImagePath = request.uri;

    //  validate, process and normalize the requested operations in query parameters
    const normalizedOperations = {};

    Object.keys(request.querystring).forEach(operation => {
        switch (operation.toLowerCase()) {
            case 'format':
                const SUPPORTED_FORMATS = ['auto', 'jpeg', 'webp', 'avif'];

                if (request.querystring[operation]['value'] && SUPPORTED_FORMATS.includes(request.querystring[operation]['value'].toLowerCase())) {
                    let format = request.querystring[operation]['value'].toLowerCase(); // normalize to lowercase

                    if (format === 'auto') {
                        if (request.headers['accept']) {
                            if (request.headers['accept'].value.includes("avif")) {
                                format = 'avif';
                            } else if (request.headers['accept'].value.includes("webp")) {
                                format = 'webp';
                            }
                        }
                    }

                    normalizedOperations['format'] =
                      request.headers['accept'] && request.headers['accept'].value.includes(format)
                        ? format : 'jpeg';
                }

                break;
            case 'width':
                const SUPPORTED_WIDTH = [160, 196, 256, 384, 428, 640, 750, 828, 1080, 1200, 1920];

                if (request.querystring[operation]['value'] && SUPPORTED_WIDTH.includes(parseInt(request.querystring[operation]['value']))) {
                    normalizedOperations['width'] = request.querystring[operation]['value'];
                }

                break;
            default:
                break;
        }
    });

    //rewrite the path to normalized version, put them in order
    const normalizedOperationsArray = [];

    if (normalizedOperations.format) normalizedOperationsArray.push('format=' + normalizedOperations.format);
    if (normalizedOperations.width) normalizedOperationsArray.push('width=' + normalizedOperations.width);
    else normalizedOperationsArray.push('width=' + 10);

    request.uri = originalImagePath + '/' + normalizedOperationsArray.join(',');

    // remove query strings
    request['querystring'] = {};

    return request;
}
