const fs = require('fs'); // pull in the file system module

// Load our index fully into memory.
// THIS IS NOT ALWAYS THE BEST IDEA.
// We are using this for simplicity. Ideally we won't have
// synchronous operations or load entire files into memory.
const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const style = fs.readFileSync(`${__dirname}/../client/style.css`);

// function to send response
const respond = (request, response, status, content, type) => {
  // set status code and content type
  response.writeHead(status, { 'Content-Type': type });
  // write the content string or buffer to response
  response.write(content);
  // send the response to the client
  response.end();
};

// function to show a success status code
const success = (request, response, params, acceptedTypes) => {
  // message to send
  const responseJSON = {
    message: 'This is a successful response',
  };

  if (acceptedTypes[0] === 'text/xml') {
  // create a valid XML string with name and age tags.
    let responseXML = '<response>';
    responseXML = `${responseXML} <message>${responseJSON.message}</message>`;
    responseXML = `${responseXML} </response>`;

    // return response passing out string and content type
    return respond(request, response, 200, responseXML, 'text/xml');
  }

  // stringify the json object (so it doesn't use references/pointers/etc)
  // but is instead a flat string object.
  // Then write it to the response.
  const responseString = JSON.stringify(responseJSON);

  // return response passing json and content type
  return respond(request, response, 200, responseString, 'application/json');
};

// function to show a bad request without the correct parameters
const badRequest = (request, response, params, acceptedTypes) => {
  let status = 200;
  const responseJSON = {
    message: 'This request has the required parameters',
  };

  // if the request does not contain a valid=true query parameter
  if (!params.valid || params.valid !== 'true') {
    status = 400;
    responseJSON.message = 'Missing valid query parameter set to true';
    responseJSON.id = 'badRequest';
  }
  if (acceptedTypes[0] === 'text/xml') {
  // create a valid XML string with name and age tags.
    let responseXML = '<response>';
    responseXML = `${responseXML} <message>${responseJSON.message}</message>`;
    if (responseJSON.id) {
      responseXML = `${responseXML} <id>${responseJSON.id}</id>`;
    }
    responseXML = `${responseXML} </response>`;
    // return response passing out string and content type
    return respond(request, response, status, responseXML, 'text/xml');
  }

  // stringify the json object (so it doesn't use references/pointers/etc)
  // but is instead a flat string object.
  // Then write it to the response.
  const responseString = JSON.stringify(responseJSON);

  // return response passing json and content type
  return respond(request, response, status, responseString, 'application/json');
};

// function to show unauthorized without the correct parameters
const unauthorized = (request, response, params, acceptedTypes) => {
  let status = 200;
  const responseJSON = {
    message: 'You have successfully viewed the content.',
  };

  // if the request does not contain a valid=true query parameter
  if (!params.loggedIn || params.loggedIn !== 'yes') {
    status = 401;
    responseJSON.message = 'Missing loggedIn query parameter set to yes';
    responseJSON.id = 'unauthorized';
  }
  if (acceptedTypes[0] === 'text/xml') {
  // create a valid XML string with name and age tags.
    let responseXML = '<response>';
    responseXML = `${responseXML} <message>${responseJSON.message}</message>`;
    if (responseJSON.id) {
      responseXML = `${responseXML} <id>${responseJSON.id}</id>`;
    }
    responseXML = `${responseXML} </response>`;
    // return response passing out string and content type
    return respond(request, response, status, responseXML, 'text/xml');
  }

  // stringify the json object (so it doesn't use references/pointers/etc)
  // but is instead a flat string object.
  // Then write it to the response.
  const responseString = JSON.stringify(responseJSON);

  // return response passing json and content type
  return respond(request, response, status, responseString, 'application/json');
};

// function for forbidden error
const forbidden = (request, response, params, acceptedTypes) => {
  const responseJSON = {
    message: 'You do not have access to this content',
    id: 'forbidden',
  };

  if (acceptedTypes[0] === 'text/xml') {
    let responseXML = '<response>';
    responseXML = `${responseXML} <message>${responseJSON.message}</message>`;
    responseXML = `${responseXML} <id>${responseJSON.id}</id>`;
    responseXML = `${responseXML} </response>`;
    return respond(request, response, 403, responseXML, 'text/xml');
  }

  const responseString = JSON.stringify(responseJSON);
  return respond(request, response, 403, responseString, 'application/json');
};

// function for internal server error
const internal = (request, response, params, acceptedTypes) => {
  const responseJSON = {
    message: 'Internal Server Error. Something went wrong.',
    id: 'internalError',
  };

  if (acceptedTypes[0] === 'text/xml') {
    let responseXML = '<response>';
    responseXML = `${responseXML} <message>${responseJSON.message}</message>`;
    responseXML = `${responseXML} <id>${responseJSON.id}</id>`;
    responseXML = `${responseXML} </response>`;
    return respond(request, response, 500, responseXML, 'text/xml');
  }

  const responseString = JSON.stringify(responseJSON);
  return respond(request, response, 500, responseString, 'application/json');
};

// function for not implemented error
const notImplemented = (request, response, params, acceptedTypes) => {
  const responseJSON = {
    message: 'A get request for this page has not been implemented yet. Check again later for updated content.',
    id: 'notImplemented',
  };

  if (acceptedTypes[0] === 'text/xml') {
    let responseXML = '<response>';
    responseXML = `${responseXML} <message>${responseJSON.message}</message>`;
    responseXML = `${responseXML} <id>${responseJSON.id}</id>`;
    responseXML = `${responseXML} </response>`;
    return respond(request, response, 501, responseXML, 'text/xml');
  }

  const responseString = JSON.stringify(responseJSON);
  return respond(request, response, 501, responseString, 'application/json');
};

// function to show not found error
const notFound = (request, response, params, acceptedTypes) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  if (acceptedTypes[0] === 'text/xml') {
    let responseXML = '<response>';
    responseXML = `${responseXML} <message>${responseJSON.message}</message>`;
    responseXML = `${responseXML} <id>${responseJSON.id}</id>`;
    responseXML = `${responseXML} </response>`;
    return respond(request, response, 404, responseXML, 'text/xml');
  }

  const responseString = JSON.stringify(responseJSON);
  return respond(request, response, 404, responseString, 'application/json');
};

// function to handle the index page
const getIndex = (request, response) => {
  respond(request, response, 200, index, 'text/html');
};

// function to handle the css
const getCSS = (request, response) => {
  respond(request, response, 200, style, 'text/css');
};

// exports to set functions to public.
module.exports = {
  getIndex,
  getCSS,
  success,
  badRequest,
  unauthorized,
  forbidden,
  internal,
  notImplemented,
  notFound,
};
