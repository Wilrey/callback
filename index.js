// Author: Wilfredo Fernandez

const clientId = "418fb399-bb7d-431c-882f-69dc24f730b9";
const environment = 'mypurecloud.de';
const form = document.querySelector("#login");
const info = document.querySelector(".alert");
const secret = document.querySelector("#secret");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const queueInput = document.querySelector("#queue");
const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');
var clientSecret ='';

function message(text) {
  info.innerHTML = text;
}

// Test token by getting role definitions in the organization.
function handleTokenCallback(body){
    return fetch(`https://api.${environment}/api/v2/authorization/roles`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${body.token_type} ${body.access_token}`
        }
    })
    .then(res => {
        if(res.ok){
            return res.json();
        } else {
            throw Error(res.statusText);
        }
    })
    .then(jsonResponse => {
        console.log(jsonResponse);
    })
    .catch(e => console.error(e));
}

function process(event) {
  event.preventDefault();
// Genesys Cloud Authentication
clientSecret = secretInput.value;
fetch(`https://login.${environment}/oauth/token`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`
    },
    body: params
})
.then(res => {
    if(res.ok){
        return message(res.json());
    } else {
        throw Error(res.statusText);
    }
})
.catch(e => console.error(e));
}
