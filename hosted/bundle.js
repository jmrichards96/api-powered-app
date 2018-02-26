
const createReplies = (id, thread, content) => {
  $("#threadForm").hide();
  $("#answerForm").show();
  $("#threadId").val(id);
  let threadPage = ``;
  threadPage += `<div class="threadRowHeader">`;
  threadPage += `<input class="threadId" name="threadId" type="hidden" value="${id}" />`;
  threadPage += `<h3>${thread.topic}</h3>`;
  threadPage += `<p>${thread.desc}</p>`;
  threadPage += `</div>`;
  threadPage += `<div class="threadReplies">`;
  for (let key in thread.replies) {
    threadPage += `<p>${thread.replies[key]}</p>`;
  }
  threadPage += `</div>`;
  content.innerHTML = threadPage;
};

const createThreads = (threads, content) => {
  $("#threadForm").show();
  $("#answerForm").hide();
  let threadRow = ``;
  for (let key in threads) {
    threadRow += `<div class="threadRow">`;
    threadRow += `<input class="threadId" name="threadId" type="hidden" value="${key}" />`;
    threadRow += `<h3>${threads[key].topic}</h3>`;
    threadRow += `<p>${threads[key].desc}</p>`;
    threadRow += `</div>`;
  }
  content.innerHTML = threadRow;
  $(".threadRow").click(function () {
    requestUpdate('get', `/getReplies?thread=${$(this).find(".threadId").val()}`);
  });
};

//function to parse our response
const parseJSON = (xhr, content, status) => {
  //parse response (obj will be empty in a 204 updated)
  const obj = JSON.parse(xhr.response);

  //if message in response, add to screen
  if (obj.message) {
    const p = document.createElement('p');
    p.textContent = `${obj.message}`;
    status.appendChild(p);
  }

  //if threads in response, add to screen
  if (obj.threads) {
    createThreads(obj.threads, content);
  } else if (obj.id && obj.thread) {
    createReplies(obj.id, obj.thread, content);
  }
};

//function to handle our response
const handleResponse = (xhr, parseResponse) => {
  const status = document.querySelector('#status');
  const content = document.querySelector('#content');
  $("#status").fadeOut(50, function () {
    //check the status code
    switch (xhr.status) {
      case 200:
        //success
        status.style.backgroundColor = "rgb(0, 70, 0)";
        status.innerHTML = ``;
        break;
      case 201:
        //created
        //grab the form's name and age fields so we can check user input
        const topicField = document.querySelector('#topicField');
        const descField = document.querySelector('#descField');
        const answerField = document.querySelector('#answerField');
        topicField.value = ``;
        descField.value = ``;
        answerField.value = ``;
        status.style.backgroundColor = "rgb(0, 70, 0)";
        status.innerHTML = '<h4>Create</h4>';
        break;
      case 204:
        //updated (no response back from server)
        status.style.backgroundColor = "rgb(0, 70, 0)";
        status.innerHTML = '<h4>Updated (No Content)</h4>';
        return;
      case 400:
        //bad request
        status.style.backgroundColor = "rgb(80, 0, 0)";
        status.innerHTML = `<h4>Bad Request</h4>`;
        break;
      case 404:
        //not found
        status.style.backgroundColor = "rgb(80, 0, 0)";
        status.innerHTML = `<h4>Resource Not Found</h4>`;
        break;
      default:
        //any other status code
        status.style.backgroundColor = "rgb(80, 0, 0)";
        status.innerHTML = `<h4>Error code not implemented by client.</h4>`;
        break;
    }

    //parse response
    if (parseResponse) {
      parseJSON(xhr, content, status);
    }
  });
  $("#status").fadeIn(200);
};

//function to send our post request
const sendPost = (e, threadForm) => {
  //grab the forms action (url to go to)
  //and method (HTTP method - POST in this case)
  const action = threadForm.getAttribute('action');
  const method = threadForm.getAttribute('method');

  //grab the form's name and age fields so we can check user input
  const topicField = threadForm.querySelector('#topicField');
  const descField = threadForm.querySelector('#descField');

  //create a new Ajax request (remember this is asynchronous)
  const xhr = new XMLHttpRequest();
  //set the method (POST) and url (action field from form)
  xhr.open(method, action);

  //set our request type to x-www-form-urlencoded
  //which is one of the common types of form data. 
  //This type has the same format as query strings key=value&key2=value2
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  //set our requested response type in hopes of a JSON response
  xhr.setRequestHeader('Accept', 'application/json');

  //set our function to handle the response
  xhr.onload = () => handleResponse(xhr, true);

  //build our x-www-form-urlencoded format. Without ajax the 
  //browser would do this automatically but it forcefully changes pages
  //which we don't want.
  //The format is the same as query strings, so key=value&key2=value2
  //The 'name' fields from the inputs are the variable names sent to
  //the server. 
  //So ours might look like  name=test&age=22
  //Again the 'name' fields in the form are the variable names in the string
  //and the variable names the server will look for.
  const formData = `topic=${topicField.value}&desc=${descField.value}`;

  //send our request with the data
  xhr.send(formData);

  //prevent the browser's default action (to send the form on its own)
  e.preventDefault();
  //return false to prevent the browser from trying to change page
  return false;
};

//function to send our reply post request
const sendPostReply = (e, answerForm) => {
  const action = answerForm.getAttribute('action');
  const method = answerForm.getAttribute('method');

  const id = answerForm.querySelector('#threadId');
  const reply = answerForm.querySelector('#answerField');

  const xhr = new XMLHttpRequest();
  xhr.open(method, action);

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Accept', 'application/json');

  xhr.onload = () => handleResponse(xhr, true);

  const formData = `threadId=${id.value}&answer=${reply.value}`;
  xhr.send(formData);

  e.preventDefault();

  return false;
};

//function to send request
const requestUpdate = (method, url) => {
  //create a new AJAX request (asynchronous)
  const xhr = new XMLHttpRequest();
  //setup connect using the selected method and url
  xhr.open(method, url);
  //set accept header in request to application/json
  //The accept header is a comma separated list of
  //accepted response types in order of preference
  //from first to last. You only need to send one
  //but you can send many, separated by commas.
  xhr.setRequestHeader('Accept', 'application/json');

  //if get request or head request
  if (method == 'get') {
    //set onload to parse request and get json message
    xhr.onload = () => handleResponse(xhr, true);
  } else {
    //set onload to check meta data and NOT message
    //There are no body responses in a head request
    xhr.onload = () => handleResponse(xhr, false);
  }

  //send ajax request
  xhr.send();

  //return false to prevent page redirection from a form
  return false;
};

// Refreshes the current page
const refreshPage = () => {
  if ($("#answerForm").is(':visible')) {
    requestUpdate('get', `/getReplies?thread=${$("#threadId").val()}`);
  } else {
    requestUpdate('get', '/getThreads');
  }
};

const init = () => {
  //grab form
  const threadForm = document.querySelector('#threadForm');
  const answerForm = document.querySelector('#answerForm');
  const refreshButton = document.querySelector('#refreshButton');
  const header = document.querySelector('#header');

  //create handler
  const addThread = e => sendPost(e, threadForm);
  const addReply = e => sendPostReply(e, answerForm);

  //attach submit event (for clicking submit or hitting enter)
  threadForm.addEventListener('submit', addThread);
  answerForm.addEventListener('submit', addReply);
  refreshButton.addEventListener('click', refreshPage);

  header.addEventListener('click', function () {
    requestUpdate('get', '/getThreads');
  });

  //add status animations
  $("#status").click(function () {
    $(this).fadeOut(200);
  });

  requestUpdate("get", "/getThreads");
};

window.onload = init;
