
exports.getLockerHandler = async(event, context) => {
    return {
        'statusCode': 200,
        'body': JSON.stringify({
            success: true,
            result: {
                id: '2-3',
                claimed: true,
                until: 9999999999999
            }
        }),
        'headers': {
            'Access-Control-Allow-Origin': '*'
        }
    };
};

exports.getClaimedLockersHandler = async(event, context) => {
    return {
        'statusCode': 200,
        'body': JSON.stringify({
            success: true,
            result: [
                {
                    id: '2-3',
                    claimed: true,
                    until: 9999999999999
                }
            ]
        }),
        'headers': {
            'Access-Control-Allow-Origin': '*'
        }
    };
};

exports.claimLockerHandler = async(event, context) => {
    return {
        'statusCode': 200,
        'body': JSON.stringify({
            success: true,
            result: {
                id: '2-3',
                claimed: true,
                by: '20211561',
                until: 9999999999999
            }
        }),
        'headers': {
            'Access-Control-Allow-Origin': '*'
        }
    };
};