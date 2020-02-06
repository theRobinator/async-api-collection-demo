import * as express from 'express';
import * as http from 'http';


async function handleRequest(request: express.Request, response: express.Response) {
    const startTime = Date.now();
    
    // Fill up a JSON object with a bunch of API calls that return Promises like fetch() does
    const configWithPromises = {
        'field1': fakeAPICall(),
        'field2': 'staticValueFromTheServer',
        'field3': fakeAPICall(),
        'field4': fakeAPIFailure(),
        'field5': fakeAPICall(),
        'field6': fakeAPICall(),
    };
    
    // Transform the Promises in the object into their return values
    const finalizedConfig = await resolvePromiseValues(configWithPromises);
    
    finalizedConfig['totalTime'] = Date.now() - startTime;
    
    // Write the resulting JSON out to the client
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.write(JSON.stringify(finalizedConfig));
    response.end();
}


/**
 * Replace any Promise keys in a given object with their resolved values.
 */
function resolvePromiseValues(config: {[key: string]: any}): Promise<{[key: string]: any}> {
    return new Promise((resolve) => {
        // Promise.all() short-circuits on a single failure, so we need to use counts here to wait for everything
        let neededCount = 0;
        let doneCount = 0;
        const resolvedConfig: {[key: string]: any} = {};
        
        for (const key in config) {
            const configValue = config[key];
            if (configValue instanceof Promise) {
                neededCount++;
                configValue
                    .catch((err) => err)  // Convert errors to successes so the client can handle them
                    .then((result) => {
                        resolvedConfig[key] = result;
                        doneCount++;
                        if (doneCount === neededCount) {
                            resolve(resolvedConfig);
                        }
                    });
                
            } else {
                resolvedConfig[key] = configValue;
            }
        }
        
        if (neededCount === 0) {
            resolve(resolvedConfig);
        }
    });
}


/**
 * Simulate an API call by delaying for a random amount of time and then returning a string.
 */
function fakeAPICall() {
    return new Promise((resolve) => {
        const delay = Math.random() * 1000;
        setTimeout(() => {
            resolve('The delay was ' + delay);
        }, delay);
    });
}


/**
 * Simulate an API call failing using a setTimeout.
 */
function fakeAPIFailure() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('This API call failed after 500ms :(');
        }, 500);
    });
}


// Start the server
const app = express();

app.get('/', handleRequest);

http.createServer(app).listen(8080, '0.0.0.0');
console.log('Server listening on http://localhost:8080');
