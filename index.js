// Author: Wilfredo Fernandez

const clientId = "418fb399-bb7d-431c-882f-69dc24f730b9";
const environment = 'mypurecloud.de';
const form = document.querySelector("#login");
const info = document.querySelector(".alert");
const secretInput = document.querySelector("#secret");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const queueInput = document.querySelector("#queue");
const params = new URLSearchParams();
var clientSecret ='';
form.addEventListener("submit", process);
params.append('grant_type', 'client_credentials');

function message(text) {
  info.innerHTML = text;
}

function process(event) {
  event.preventDefault();
// Genesys Cloud Authentication
clientSecret = secretInput.value;
console.log("Client Secret : " + clientSecret);
fetch(`https://login.${environment}/oauth/token`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(clientId + ':' + clientSecret).toString('base64')}`
    },
    body: params
})
.then(res => {
  console.log("Res : " + res);
    if(res.ok){
        return message(res.json());
    } else {
        throw Error(res.statusText);
    }
})
.catch(e => console.error(e));
}
