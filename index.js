// Author: Wilfredo Fernandez

const clientId = "418fb399-bb7d-431c-882f-69dc24f730b9";
const ENVIRONMENT = 'mypurecloud.de';
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
var encodedData = window.btoa(clientId + ':' + clientSecret);
  
  $.ajax({
    url: `https://login.${ENVIRONMENT}/oauth/token`,
    type: "post",
    data: {"grant_type": "client_credentials"},
    contentType: "application/x-www-form-urlencoded",
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'Basic ' + encodedData);
    },
    success: function(data) {
      console.log(data);
    }
  })
}
