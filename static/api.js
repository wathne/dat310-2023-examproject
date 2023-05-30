/* Async functions for REST-API.
 * See also "../app.py".
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
 *   <script src="/static/api.js" type="text/javascript"></script>
 *   <!-- Other JavaScript file. -->
 *   <script src="/static/script.js" type="text/javascript"></script>
 * </body>
 * </html>
*/

"use strict";


async function sessionRegister(username, password) {
  const response = await fetch(
    "/api/users",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "username": username,
        "password": password,
      }),
    },
  );
  // Returns userId or null.
  return response.json();
}


async function sessionLogin(username, password) {
  const response = await fetch(
    "/api/login",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "username": username,
        "password": password,
      }),
    },
  );
  // Returns userId or null.
  return response.json();
}


async function sessionLogout() {
  const response = await fetch(
    "/api/logout",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify(null),
    },
  );
  // Returns userId or null.
  return response.json();
}


async function insertImage(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile)
  const response = await fetch(
    "/api/images",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        // The request will fail if we explicitly set the content-type header.
        //"content-type": "multipart/form-data",
      },
      body: formData,
    },
  );
  // Returns imageId or null.
  return response.json();
}


async function retrieveImage(imageId) {
  const response = await fetch(
    `/api/images/${imageId}`,
    {
      method: "GET",
      headers: {
        "accept": "image/*, application/json",
      },
    },
  );
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    // Returns null.
    return response.json();
  }
  // Returns image blob.
  return response.blob();
}
/* // https://developer.mozilla.org/en-US/docs/Web/API/Response/blob
 * retrieveImage(imageId).then((imageBlob) => {
 *   if (imageBlob === null) {
 *     return null;
 *   }
 *   const imageURL = URL.createObjectURL(imageBlob);
 *   testImage.src = imageURL;
 * });
 * // To release imageURL, call URL.revokeObjectURL(imageURL).
*/


async function retrieveThumbnail(imageId) {
  const response = await fetch(
    `/api/thumbnails/${imageId}`,
    {
      method: "GET",
      headers: {
        "accept": "image/*, application/json",
      },
    },
  );
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    // Returns null.
    return response.json();
  }
  // Returns thumbnail blob.
  return response.blob();
}
/* // https://developer.mozilla.org/en-US/docs/Web/API/Response/blob
 * retrieveThumbnail(imageId).then((thumbnailBlob) => {
 *   if (thumbnailBlob === null) {
 *     return null;
 *   }
 *   const thumbnailURL = URL.createObjectURL(thumbnailBlob);
 *   testThumbnail.src = thumbnailURL;
 * });
 * // To release thumbnailURL, call URL.revokeObjectURL(thumbnailURL).
*/


async function insertThread(threadSubject, postText, imageId) {
  const response = await fetch(
    "/api/threads",
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "image_id": imageId,
        "post_text": postText,
        "thread_subject": threadSubject,
      }),
    },
  );
  // Returns threadId or null.
  return response.json();
}


async function retrieveThread(threadId) {
  const response = await fetch(
    `/api/threads/${threadId}`,
    {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    },
  );
  // Returns thread and posts or null.
  return response.json();
}
/* thread_and_posts = {
 *   "thread": {
 *     "post_id": int | null,
 *     "thread_id": int,
 *     "thread_last_modified": int,
 *     "thread_subject": str,
 *     "thread_timestamp": int,
 *     "user_id": int,
 *   },
 *   "posts": [
 *     {
 *       "image_id": int | null,
 *       "post_id": int,
 *       "post_last_modified": int,
 *       "post_text": str,
 *       "post_timestamp": int,
 *       "thread_id": int,
 *       "user_id": int,
 *     },
 *     {
 *       "image_id": int | null,
 *       "post_id": int,
 *       "post_last_modified": int,
 *       "post_text": str,
 *       "post_timestamp": int,
 *       "thread_id": int,
 *       "user_id": int,
 *     },
 *     ...
 *   ],
 * };
*/


async function retrieveThreads() {
  const response = await fetch(
    "/api/threads",
    {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    },
  );
  // Returns threads or null.
  return response.json();
}
/* threads = [
 *   {
 *     "post_id": int | null,
 *     "thread_id": int,
 *     "thread_last_modified": int,
 *     "thread_subject": str,
 *     "thread_timestamp": int,
 *     "user_id": int,
 *   },
 *   {
 *     "post_id": int | null,
 *     "thread_id": int,
 *     "thread_last_modified": int,
 *     "thread_subject": str,
 *     "thread_timestamp": int,
 *     "user_id": int,
 *   },
 *   ...
 * ];
*/


async function insertPost(threadId, postText, imageId) {
  const response = await fetch(
    `/api/threads/${threadId}/posts`,
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "image_id": imageId,
        "post_text": postText,
      }),
    },
  );
  // Returns postId or null.
  return response.json();
}


async function insertPostV2(threadId, postText, imageId) {
  const response = await fetch(
    `/api/threads/${threadId}`,
    {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        "image_id": imageId,
        "post_text": postText,
      }),
    },
  );
  // Returns postId or null.
  return response.json();
}


async function retrievePost(postId) {
  const response = await fetch(
    `/api/posts/${postId}`,
    {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    },
  );
  // Returns post or null.
  return response.json();
}
/* post = {
 *   "post_id": int | null,
 *   "thread_id": int,
 *   "thread_last_modified": int,
 *   "thread_subject": str,
 *   "thread_timestamp": int,
 *   "user_id": int,
 * };
*/


async function retrievePosts(threadId) {
  const response = await fetch(
    `/api/threads/${threadId}/posts`,
    {
      method: "GET",
      headers: {
        "accept": "application/json",
      },
    },
  );
  // Returns posts or null.
  return response.json();
}
/*
 * posts = [
 *   {
 *     "image_id": int | null,
 *     "post_id": int,
 *     "post_last_modified": int,
 *     "post_text": str,
 *     "post_timestamp": int,
 *     "thread_id": int,
 *     "user_id": int,
 *   },
 *   {
 *     "image_id": int | null,
 *     "post_id": int,
 *     "post_last_modified": int,
 *     "post_text": str,
 *     "post_timestamp": int,
 *     "thread_id": int,
 *     "user_id": int,
 *   },
 *   ...
 * ];
 */

