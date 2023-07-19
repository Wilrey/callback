// Author: Wilfredo Fernandez

// Make sure to enable "Placing calls with another app?" on Call -> Settings -> Phone Settings

// Define constant variables
const CLIENT_ID = 'ee4696b8-16c4-40ce-87ae-7322597880ac';
const ENVIRONMENT = 'mypurecloud.de';

// Select HTML elements
const form = document.querySelector("#login");
const phoneInput = document.querySelector("#phone");
const info = document.querySelector(".alert");

// Attach event listener to form submit
form.addEventListener("submit", process);

/**
 * Extracts the value of a URL parameter by name
 * @param {string} name - The name of the parameter
 * @returns {string} - The value of the parameter or an empty string if not found
 */
function getParameterByName(name) {
  name = name.replace(/[\\[]/, "\\[").replace(/[\]]/, "\\]");
  const regex = new RegExp("[\\#&]" + name + "=([^&#]*)");
  const results = regex.exec(location.hash);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/**
 * Handles the form submission event
 * @param {Event} event - The form submission event
 */
function process(event) {
  event.preventDefault();
  const phoneNumber = phoneInput.value;
  const queue = '07b54d9e-b08b-4587-a4bd-7e0055ebed0b';
  info.innerHTML = `Placing call to Phone number in E.164 format: <strong>${phoneNumber}</strong>`;
  placeCall(phoneNumber, queue);
}

/**
 * Places a call using AJAX
 * @param {string} phone - The phone number
 * @param {string} queue - The queue ID
 */
function placeCall(phone, queue) {
  const token = getParameterByName('access_token');
  $.ajax({
    url: `https://api.${ENVIRONMENT}/api/v2/conversations/calls`,
    type: "post",
    data: JSON.stringify({
      "phoneNumber": phone,
      "callFromQueueId": queue
    }),
    contentType: "application/json; charset=utf-8",
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'bearer ' + token);
    },
    success: function(data) {
      console.log(data);
    }
  });
}

// Check if there is a hash in the URL
if (window.location.hash) {
  const token = getParameterByName('access_token');
  console.log("token" + token);
  $.ajax({
    url: `https://api.${ENVIRONMENT}/api/v2/users/me`,
    type: "GET",
    beforeSend: function(xhr) {
      xhr.setRequestHeader('Authorization', 'bearer ' + token);
    },
    success: function(data) {
      console.log(data);
    }
  });
} else {
  const queryStringData = {
    response_type: "token",
    client_id: CLIENT_ID,
    redirect_uri: "https://wilrey.github.io/placeCall/index.html"
  };
  window.location.replace(`https://login.${ENVIRONMENT}/oauth/authorize?` + jQuery.param(queryStringData));
}
