/* Form validation functions.
 * 
 * 
 * Load order:
 * -----------
 *   /static/api.js
 *   /static/form-validation.js <- YOU ARE HERE
 *   /static/box.js
 *   /static/handler.js
 *   /static/imageboard.js
 * 
 * 
 * Function overview:
 * ------------------
 *   userValidation(formData)
 *   threadValidation(formData)
 *     > imageValidation(imageFile)
 *   postValidation(formData)
 *     > imageValidation(imageFile)
 * 
 * 
 * Load this JavaScript file before other JavaScript files.
 * 
 * <!DOCTYPE html>
 * <html>
 * <head>
 * </head>
 * <body>
 *   <header>
 *   </header>
 *   <main>
 *   </main>
 *   <footer>
 *   </footer>
 *   <!-- This JavaScript file. -->
 *   <script src="/static/form-validation.js" type="text/javascript"></script>
 *   <!-- Other JavaScript file. -->
 *   <script src="/static/script.js" type="text/javascript"></script>
 * </body>
 * </html>
 */

"use strict";


// This form validation function is a "first line of defence".
// The server will do a final validation and may also return an error.
function userValidation(formData) {
  const dataObject = Object.fromEntries(formData);
  const username = dataObject["username"];
  const password = dataObject["password"];
  const errors = [];

  if (username.length === 0) {
    errors.push("Your username can not be empty.")
  }

  if (password.length < 8) {
    errors.push("Your password must be at least 8 characters long.")
  }

  if (errors.length) {
    return errors;
  }
  return null;
}


// This form validation function is a "first line of defence".
// The server will do a final validation and may also return an error.
function imageValidation(imageFile) {
  const errors = [];

  // Nothing here yet.

  if (errors.length) {
    return errors;
  }
  return null;
}


// This form validation function is a "first line of defence".
// The server will do a final validation and may also return an error.
function threadValidation(formData) {
  const dataObject = Object.fromEntries(formData);
  const imageFile = dataObject["image"];
  const postText = dataObject["text"];
  const threadSubject = dataObject["subject"];
  const errors = [];

  const imageErrors = imageValidation(imageFile);
  if (imageErrors !== null) {
    for (const imageError of imageErrors) {
      errors.push(imageError);
    }
  }

  if (threadSubject.length === 0) {
    errors.push("The thread subject can not be empty.")
  }

  if (errors.length) {
    return errors;
  }
  return null;
}


// This form validation function is a "first line of defence".
// The server will do a final validation and may also return an error.
function postValidation(formData) {
  const dataObject = Object.fromEntries(formData);
  const imageFile = dataObject["image"];
  const postText = dataObject["text"];
  const errors = [];

  const imageErrors = imageValidation(imageFile);
  if (imageErrors !== null) {
    for (const imageError of imageErrors) {
      errors.push(imageError);
    }
  }

  // Nothing here yet.

  if (errors.length) {
    return errors;
  }
  return null;
}

