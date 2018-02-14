//function to parse our response
const parseJSON = (xhr, content) => {
    //parse response (obj will be empty in a 204 updated)
    const obj = JSON.parse(xhr.response);
    console.dir(obj);
    
    //if message in response, add to screen
    if(obj.message) {
      const p = document.createElement('p');
      p.textContent = `Message: ${obj.message}`;
      content.appendChild(p);
    }
    
    //if users in response, add to screen
    if(obj.users) {
      const userList = document.createElement('p');
      const users = JSON.stringify(obj.users);
      userList.textContent = users;
      content.appendChild(userList);
    }
};

//function to handle our response
const handleResponse = (xhr, parseResponse) => {
  const content = document.querySelector('#content');
  
  //check the status code
  switch(xhr.status) {
    case 200: //success
      content.innerHTML = `<b>Success</b>`;
      break;
    case 201: //created
      content.innerHTML = '<b>Create</b>';
      break;
    case 204: //updated (no response back from server)
      content.innerHTML = '<b>Updated (No Content)</b>';
      return;
    case 400: //bad request
      content.innerHTML = `<b>Bad Request</b>`;
      break;
    case 404: //not found
      content.innerHTML = `<b>Resource Not Found</b>`;
      break;
    default: //any other status code
      content.innerHTML = `Error code not implemented by client.`;
      break;
  }

  //parse response
  if(parseResponse) {
    parseJSON(xhr, content, parseResponse);
  }
};

//function to send our post request
const sendPost = (e, nameForm) => {
  //grab the forms action (url to go to)
  //and method (HTTP method - POST in this case)
  const nameAction = nameForm.getAttribute('action');
  const nameMethod = nameForm.getAttribute('method');
  
  //grab the form's name and age fields so we can check user input
  const nameField = nameForm.querySelector('#nameField');
  const ageField = nameForm.querySelector('#ageField');
  
  //create a new Ajax request (remember this is asynchronous)
  const xhr = new XMLHttpRequest();
  //set the method (POST) and url (action field from form)
  xhr.open(nameMethod, nameAction);
  
  //set our request type to x-www-form-urlencoded
  //which is one of the common types of form data. 
  //This type has the same format as query strings key=value&key2=value2
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  //set our requested response type in hopes of a JSON response
  xhr.setRequestHeader ('Accept', 'application/json');
  
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
  const formData = `name=${nameField.value}&age=${ageField.value}`;
  
  //send our request with the data
  xhr.send(formData);

  //prevent the browser's default action (to send the form on its own)
  e.preventDefault();
  //return false to prevent the browser from trying to change page
  return false;
};

//function to send request
const requestUpdate = (e, userForm) => {
  //grab url field 
  const url = userForm.querySelector('#urlField').value;
  //grab method selected
  const method = userForm.querySelector('#methodSelect').value;
  
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
  if(method == 'get') {
    //set onload to parse request and get json message
    xhr.onload = () => handleResponse(xhr, true);
  } else {
    //set onload to check meta data and NOT message
    //There are no body responses in a head request
    xhr.onload = () => handleResponse(xhr, false);
  }
  
  //send ajax request
  xhr.send();
  
  //cancel browser's default action
  e.preventDefault();
  //return false to prevent page redirection from a form
  return false;
};

const init = () => {
  //grab form
  const nameForm = document.querySelector('#nameForm');
  const userForm = document.querySelector('#userForm');
  
  //create handler
  const addUser = (e) => sendPost(e, nameForm);
  const getUsers = (e) => requestUpdate(e, userForm);
  
  //attach submit event (for clicking submit or hitting enter)
  nameForm.addEventListener('submit', addUser);
  userForm.addEventListener('submit', getUsers);
};

window.onload = init;