const https = require("https");

function request_body(result) {
    return new Promise((resolve, reject) => {
        https.get('https://canvas.ssu.ac.kr/learningx/login/from_cc?result=' + result, (res) => {
            let body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                resolve(body);
            });
        }).on('error', (res) => {
            console.log("Error thrown..");
            reject(res);
        });
    });
}

async function obtain_id(result) {
    try {
        const body = await request_body(encodeURIComponent(result));
        if (body.indexOf("pseudonym_session_unique_id") < 0) {
            return {success: false, code: 401, reason: "Unauthorized"};
        }
        const id = body.substring(body.indexOf('pseudonym_session_unique_id') + 36).split('"')[0];
        return {success: true, code: 200, id};
    } catch (err) {
        return {success: false, code: 500, reason: "Internal Error"};
    }
}

async function validateSsuSso() {
    const body = JSON.parse(event.body);
    const authentication_code = body.code;
    if (authentication_code) {
        console.log(authentication_code);
        const id = await obtain_id(authentication_code);
        return {
            'statusCode': id.code,
            'body': JSON.stringify(id)
        };
    }
    return {
        'statusCode': 401,
        'body': JSON.stringify({
            success: false,
            reason: 'Unauthorized'
        })
    };
}

let response;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (event, context) => {
    try {
        if (!event.headers["Accept"].includes("application/json")) {
            response = {
                'statusCode': 500,
                'body': JSON.stringify({
                    "success": false,
                    "reason": "Only application/json Content-Type is applicable."
                })
            }
            return response;
        }

    } catch (err) {
        console.log("Error Thrown:" + err);
        return err;
    }

    return response
};
