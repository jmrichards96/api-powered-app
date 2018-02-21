// Note this object is purely in memory
// When node shuts down this will be cleared.
// Same when your heroku app shuts down from inactivity
const threads = {};

// function to respond with a json object
// takes request, response, status code and object to send
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// function to respond without json body
// takes request, response and status code
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// return user object as JSON
const getThreads = (request, response) => {
  const responseJSON = {
    threads,
  };
  return respondJSON(request, response, 200, responseJSON);
};

// return user object as JSON
const getReplies = (request, response, params) => {
  const responseJSON = {};
  if (!params.thread || !threads[params.thread]) {
    responseJSON.message = 'Missing valid thread query parameter.';
    return respondJSON(request, response, 400, responseJSON);
  }
  responseJSON.id = params.thread;
  responseJSON.thread = threads[params.thread];
  return respondJSON(request, response, 200, responseJSON);
};

// get meta info about user object
// should calculate a 200
const getThreadsMeta = (request, response) => {
  // return 200 without message, just the meta data
  respondJSONMeta(request, response, 200);
};

// get meta info about user object
// should calculate a 200
const getRepliesMeta = (request, response) => {
  // return 200 without message, just the meta data
  respondJSONMeta(request, response, 200);
};

// function to add a user from a POST body
const addThread = (request, response, body) => {
  // default json message
  const responseJSON = {
    message: 'Question and description are both required.',
  };

  // check to make sure we have both fields
  // We might want more validation than just checking if they exist
  // This could easily be abused with invalid types (such as booleans, numbers, etc)
  // If either are missing, send back an error message as a 400 badRequest
  if (!body.topic || !body.desc) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // default status code to 201 created
  const responseCode = 201;

  // if that thread's topic already exists in our object create a unique topic
  let uniqueTopic = body.topic;
  if (threads[uniqueTopic]) {
    let i = 1;
    while (threads[uniqueTopic + i]) {
      ++i;
    }
    uniqueTopic += i;
  }

  threads[uniqueTopic] = {};

  // add or update fields for this user name
  threads[uniqueTopic].topic = body.topic;
  threads[uniqueTopic].desc = body.desc;
  threads[uniqueTopic].replies = [];
  const date = new Date();
  threads[uniqueTopic].creationTime = date.getTime();

  // if response is created, then set our created message
  // and sent response with a message
  responseJSON.message = 'Created Successfully';
  return respondJSON(request, response, responseCode, responseJSON);
};

// function to add a user from a POST body
const addReply = (request, response, body) => {
  const responseJSON = {
    message: 'Answer is required.',
  };

  if (!body.threadId || !body.answer) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }
  if (!threads[body.threadId]) {
    responseJSON.id = 'notFound';
    responseJSON.message = 'Could not find specified thread.';
    return respondJSON(request, response, 404, responseJSON);
  }

  // default status code to 201 created
  const responseCode = 201;

  // Add the submitted reply to the list of replies on the thread
  threads[body.threadId].replies.push(body.answer);

  // if response is created, then set our created message
  // and sent response with a message
  responseJSON.message = 'Created Successfully';
  return respondJSON(request, response, responseCode, responseJSON);
};

// function for 404 not found requests with message
const notFound = (request, response) => {
  // create error message for response
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };

  // return a 404 with an error message
  respondJSON(request, response, 404, responseJSON);
};

// function for 404 not found without message
const notFoundMeta = (request, response) => {
  // return a 404 without an error message
  respondJSONMeta(request, response, 404);
};

module.exports = {
  getThreads,
  getThreadsMeta,
  getReplies,
  getRepliesMeta,
  addThread,
  addReply,
  notFound,
  notFoundMeta,
};
