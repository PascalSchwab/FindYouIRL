const REQUEST_TYPE = {
    GET: "GET",
    POST: "POST",
    DELETE: "DELETE",
    PUT: "PUT"
};

async function postRequest(url, body){
    return await sendRequest(REQUEST_TYPE.POST, url, body, true);
}

async function getRequest(url){
    return await sendRequest(REQUEST_TYPE.GET, url, undefined, true);
}

async function sendRequest(requestType, url, body) {
    let requestBody = (typeof body !== "undefined") ? JSON.stringify(body) : undefined;
    let basicHeader =
    {
        headers: {
            'Content-Type': 'application/json'
        },
        method: requestType,
        body: requestBody
    };
    return await fetch(url, basicHeader)
        .then(async (response) => {
            let data = await response.json().catch((error)=>{});
            return {
                data: data,
                status: response.status
            };
        })
        .catch((error) => {
            console.error("Fetch error: " + error);
        });
}