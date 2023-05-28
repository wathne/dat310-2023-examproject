"use strict";

const buttonAddThreadElements = document.getElementsByClassName("button-add-thread");
const buttonRegisterElements = document.getElementsByClassName("button-register");
const buttonLoginElements = document.getElementsByClassName("button-login");
const buttonLogoutElements = document.getElementsByClassName("button-logout");
const buttonCancelElements = document.getElementsByClassName("button-cancel");

const divMainExtraElement = document.getElementById("main-extra");
const divAddThreadElement = document.getElementById("add-thread");
const divRegisterElement = document.getElementById("register");
const divLoginElement = document.getElementById("login");
const divLogoutElement = document.getElementById("logout");
const divMainContentElement = document.getElementById("main-content");

const formAddThreadElement = document.getElementById("form-add-thread");
const formRegisterElement = document.getElementById("form-register");
const formLoginElement = document.getElementById("form-login");
const formLogoutElement = document.getElementById("form-logout");

const inputFileAddThreadElement = document.getElementById("input-file-add-thread");

const thumbnailAddThreadElement = document.getElementById("thumbnail-add-thread");

const filterSearchElement = document.getElementById("filter-search");
const filterSortOrderElement = document.getElementById("filter-sort-order");
const filterCriteriaElement = document.getElementById("filter-criteria");

// Placeholder URL.
const pixelPNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";


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


class Post {
  // Private instance fields.
  #retrievedPost;
  #retrievedImage;
  #done;
  #hidden;
  #imageId;
  #postId;
  #postLastModified;
  #postText;
  #postTimestamp;
  #threadId;
  #userId;
  #mainElement;
  #thumbnailContainerElement;
  #thumbnailElement;
  #postTextElement;
  #testElement; // TODO(wathne): Delete #testElement.

  static async createPostFromPostId(postId) {
    if (typeof postId === "number") {
      return await new Post().rebuildPostFromPostId(postId);
    }
    return null;
  }

  static async createPostFromPostObject(postObject) {
    if (typeof postObject === "object" && postObject !== null) {
      return await new Post().rebuildPostFromPostObject(postObject);
    }
    return null;
  }

  constructor() {
    this.#mainElement = document.createElement("div");
    this.#mainElement.className = "post";
    this.#thumbnailContainerElement = document.createElement("div");
    this.#thumbnailContainerElement.className = "thumbnail-container";
    this.#thumbnailElement = document.createElement("img");
    this.#thumbnailElement.className = "thumbnail";
    this.#thumbnailContainerElement.appendChild(this.#thumbnailElement);
    this.#thumbnailElement.alt = "";
    this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
    this.#postTextElement = document.createElement("div");
    this.#postTextElement.className = "post-text";
    this.#testElement = document.createElement("div"); // TODO: Delete.
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[Post] ` +
           `imageId: "${this.#imageId}", ` +
           `postId: "${this.#postId}", ` +
           `postLastModified: "${this.#postLastModified}", ` +
           `postText: "${this.#postText}", ` +
           `postTimestamp: "${this.#postTimestamp}", ` +
           `threadId: "${this.#threadId}", ` +
           `userId: "${this.#userId}"`;
  }

  // Private instance method.
  #empty() {
    this.#retrievedPost = false;
    this.#retrievedImage = false;
    this.#done = false;
    this.#hidden = true;
    this.#imageId = null;
    this.#postId = null;
    this.#postLastModified = null;
    this.#postText = null;
    this.#postTimestamp = null;
    this.#threadId = null;
    this.#userId = null;
  }

  // Private instance method.
  #demolish() {
    while (this.#mainElement.firstChild) {
      this.#mainElement.removeChild(this.#mainElement.firstChild);
    }
    const previousURL = this.#thumbnailElement.src;
    if (previousURL !== pixelPNG && previousURL !== "") {
      this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
      URL.revokeObjectURL(previousURL); // Release previous file reference.
      console.log(`Revoked URL: "${previousURL}"`); // TODO: Delete.
    }
    this.#postTextElement.textContent = "";
    this.#testElement.textContent = ""; // TODO: Delete.
  }

  // TODO(wathne): Delete #testElement.
  // Private instance method.
  #appendTestElement() {
    this.#testElement.textContent = this.toHumanReadable();
    this.#mainElement.appendChild(this.#testElement);
  }

  // Private instance method.
  #finally() {
    this.#appendTestElement(); // TODO: Delete.
    this.#done = true;
    return this;
  }

  // Calling rebuildPostFromPostId() without a postId argument will by default
  // attempt to use the existing this.#postId instance field.
  async rebuildPostFromPostId(postId) {
    const previousPostId = typeof this.#postId === "number" ?
      this.#postId :
      null;
    this.#empty();
    this.#demolish();
    this.#postId = typeof postId === "number" ?
      postId :
      previousPostId;
    if (this.#postId === null) {
      return this.#finally();
    }
    const post = await retrievePost(this.#postId)
      .catch((error) => {
        console.error(error);
      });
    if (post === null) {
      return this.#finally();
    }
    this.#imageId = post["image_id"];
    this.#postLastModified = post["post_last_modified"];
    this.#postText = post["post_text"];
    this.#postTimestamp = post["post_timestamp"];
    this.#threadId = post["thread_id"];
    this.#userId = post["user_id"];
    this.#retrievedPost = true;
    this.#postTextElement.textContent = this.#postText;
    // Display post text as soon as possible.
    this.#mainElement.appendChild(this.#postTextElement);
    if (this.#imageId === null) {
      return this.#finally();
    }
    const imageBlob = await retrieveImage(this.#imageId)
      .catch((error) => {
        console.error(error);
      });
    if (imageBlob === null) {
      return this.#finally();
    }
    this.#retrievedImage = true;
    this.#thumbnailElement.src = URL.createObjectURL(imageBlob);
    // Display thumbnail as soon as possible.
    this.#mainElement.appendChild(this.#thumbnailContainerElement);
    return this.#finally();
  }

  // Calling rebuildPostFromPostObject() without a postObject argument will by
  // default attempt to use the existing this.#postId instance field.
  async rebuildPostFromPostObject(postObject) {
    const previousPostId = typeof this.#postId === "number" ?
      this.#postId :
      null;
    this.#empty();
    this.#demolish();
    // Note: typeof null is "object". We need to explicitly check if null.
    if (typeof postObject !== "object" || postObject === null) {
      return this.rebuildPostFromPostId(previousPostId);
    }
    this.#imageId = postObject["image_id"];
    this.#postId = postObject["post_id"];
    this.#postLastModified = postObject["post_last_modified"];
    this.#postText = postObject["post_text"];
    this.#postTimestamp = postObject["post_timestamp"];
    this.#threadId = postObject["thread_id"];
    this.#userId = postObject["user_id"];
    if (typeof this.#postId !== "number") {
      // Attempt to use the previous value of the this.#postId instance field.
      return this.rebuildPostFromPostId(previousPostId);
    }
    // this.#imageId has to be a number or null.
    if (typeof this.#imageId !== "number" && this.#imageId !== null) {
      return this.rebuildPostFromPostId(this.#postId);
    }
    // Unchecked: postLastModified, postText, postTimestamp, threadId, userId.
    this.#retrievedPost = true;
    this.#postTextElement.textContent = this.#postText;
    // Display post text as soon as possible.
    this.#mainElement.appendChild(this.#postTextElement);
    if (this.#imageId === null) {
      return this.#finally();
    }
    const imageBlob = await retrieveImage(this.#imageId)
      .catch((error) => {
        console.error(error);
      });
    if (imageBlob === null) {
      return this.#finally();
    }
    this.#retrievedImage = true;
    this.#thumbnailElement.src = URL.createObjectURL(imageBlob);
    // Display thumbnail as soon as possible.
    this.#mainElement.appendChild(this.#thumbnailContainerElement);
    return this.#finally();
  }

  hasPost() {
    return this.#retrievedPost; // Boolean.
  }

  hasImage() {
    return this.#retrievedImage; // Boolean.
  }

  isDone() {
    return this.#done; // Boolean
  }

  isVisible() {
    return !this.#hidden; // Boolean
  }

  getElement() {
    return this.#mainElement;
  }

  filterCompare(filterSearch, filterCriteria) {
    if (!this.#retrievedPost) {
      this.#hidden = true;
      return;
    }
    if (filterSearch === "" && filterCriteria !== "image") {
      this.#hidden = false;
      return;
    }
    const searchLC = filterSearch.toLowerCase();
    switch (filterCriteria) {
      case "image":
        if (this.#retrievedImage) {
          this.#hidden = false;
          return;
        }
        this.#hidden = true;
        return;
      case "last-modified":
        this.#hidden = false;
        return;
      case "subject":
        this.#hidden = false;
        return;
      case "text":
        const textLC = this.#postText.toLowerCase();
        if (textLC.includes(searchLC)) {
          this.#hidden = false;
          return;
        }
        this.#hidden = true;
        return;
      case "timestamp":
        this.#hidden = false;
        return;
    }
    this.#hidden = false;
  }
}


class Thread {
  // Private instance fields.
  #posts;
  #retrievedThread;
  #retrievedPost;
  #retrievedImage;
  #done;
  #hidden;
  #imageId;
  #postId;
  #postText;
  #threadId;
  #threadLastModified;
  #threadSubject;
  #threadTimestamp;
  #userId;
  #mainElement;
  #threadSubjectElement;
  #thumbnailContainerElement;
  #thumbnailElement;
  #postTextElement;
  #testElement; // TODO(wathne): Delete #testElement.

  static async createThreadFromThreadId(threadId) {
    if (typeof threadId === "number") {
      return await new Thread().rebuildThreadFromThreadId(threadId);
    }
    return null;
  }

  static async createThreadFromThreadObject(threadObject) {
    if (typeof threadObject === "object" && threadObject !== null) {
      return await new Thread().rebuildThreadFromThreadObject(threadObject);
    }
    return null;
  }

  constructor() {
    this.#posts = [];
    this.#mainElement = document.createElement("div");
    this.#mainElement.className = "thread";
    this.#threadSubjectElement = document.createElement("div");
    this.#threadSubjectElement.className = "thread-subject";
    this.#thumbnailContainerElement = document.createElement("div");
    this.#thumbnailContainerElement.className = "thumbnail-container";
    this.#thumbnailElement = document.createElement("img");
    this.#thumbnailElement.className = "thumbnail";
    this.#thumbnailContainerElement.appendChild(this.#thumbnailElement);
    this.#thumbnailElement.alt = "";
    this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
    this.#postTextElement = document.createElement("div");
    this.#postTextElement.className = "thread-text";
    this.#testElement = document.createElement("div"); // TODO: Delete.
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[Thread] ` +
           `imageId: "${this.#imageId}", ` +
           `postId: "${this.#postId}", ` +
           `postText: "${this.#postText}", ` +
           `threadId: "${this.#threadId}", ` +
           `threadLastModified: "${this.#threadLastModified}", ` +
           `threadSubject: "${this.#threadSubject}", ` +
           `threadTimestamp: "${this.#threadTimestamp}", ` +
           `userId: "${this.#userId}"`;
  }

  // Private instance method.
  #empty() {
    this.#retrievedThread = false;
    this.#retrievedPost = false;
    this.#retrievedImage = false;
    this.#done = false;
    this.#hidden = true;
    this.#imageId = null;
    this.#postId = null;
    this.#postText = null;
    this.#threadId = null;
    this.#threadLastModified = null;
    this.#threadSubject = null;
    this.#threadTimestamp = null;
    this.#userId = null;
  }

  // Private instance method.
  #demolish() {
    while (this.#mainElement.firstChild) {
      this.#mainElement.removeChild(this.#mainElement.firstChild);
    }
    this.#threadSubjectElement.textContent = "";
    const previousURL = this.#thumbnailElement.src;
    if (previousURL !== pixelPNG && previousURL !== "") {
      this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
      URL.revokeObjectURL(previousURL); // Release previous file reference.
      console.log(`Revoked URL: "${previousURL}"`); // TODO: Delete.
    }
    this.#postTextElement.textContent = "";
    this.#testElement.textContent = ""; // TODO: Delete.
  }

  // TODO(wathne): Delete #testElement.
  // Private instance method.
  #appendTestElement() {
    this.#testElement.textContent = this.toHumanReadable();
    this.#mainElement.appendChild(this.#testElement);
  }

  // Private instance method.
  #finally() {
    this.#appendTestElement(); // TODO: Delete.
    this.#done = true;
    return this;
  }

  // TODO(wathne): retrieveThread returns thread_and_posts, not thread, fix it.
  // Calling rebuildThreadFromThreadId() without a threadId argument will by
  // default attempt to use the existing this.#threadId instance field.
  async rebuildThreadFromThreadId(threadId) {
    const previousThreadId = typeof this.#threadId === "number" ?
      this.#threadId :
      null;
    this.#empty();
    this.#demolish();
    this.#threadId = typeof threadId === "number" ?
      threadId :
      previousThreadId;
    if (this.#threadId === null) {
      return this.#finally();
    }
    const thread = await retrieveThread(this.#threadId)
      .catch((error) => {
        console.error(error);
      });
    if (thread === null) {
      return this.#finally();
    }
    this.#postId = thread["post_id"];
    this.#threadLastModified = thread["thread_last_modified"];
    this.#threadSubject = thread["thread_subject"];
    this.#threadTimestamp = thread["thread_timestamp"];
    this.#userId = thread["user_id"];
    this.#retrievedThread = true;
    this.#threadSubjectElement.textContent = this.#threadSubject;
    // Display thread subject as soon as possible.
    this.#mainElement.appendChild(this.#threadSubjectElement);
    if (this.#postId === null) {
      return this.#finally();
    }
    const post = await retrievePost(this.#postId)
      .catch((error) => {
        console.error(error);
      });
    if (post === null) {
      return this.#finally();
    }
    this.#imageId = post["image_id"];
    this.#postText = post["post_text"];
    this.#retrievedPost = true;
    this.#postTextElement.textContent = this.#postText;
    // Display post text as soon as possible.
    this.#mainElement.appendChild(this.#postTextElement);
    if (this.#imageId === null) {
      return this.#finally();
    }
    const imageBlob = await retrieveImage(this.#imageId)
      .catch((error) => {
        console.error(error);
      });
    if (imageBlob === null) {
      return this.#finally();
    }
    this.#retrievedImage = true;
    this.#thumbnailElement.src = URL.createObjectURL(imageBlob);
    // Display thumbnail as soon as possible.
    this.#mainElement.appendChild(this.#thumbnailContainerElement);
    return this.#finally();
  }

  // Calling rebuildThreadFromThreadObject() without a threadObject argument
  // will by default attempt to use the existing this.#threadId instance field.
  async rebuildThreadFromThreadObject(threadObject) {
    const previousThreadId = typeof this.#threadId === "number" ?
      this.#threadId :
      null;
    this.#empty();
    this.#demolish();
    // Note: typeof null is "object". We need to explicitly check if null.
    if (typeof threadObject !== "object" || threadObject === null) {
      return this.rebuildThreadFromThreadId(previousThreadId);
    }
    this.#postId = threadObject["post_id"];
    this.#threadId = threadObject["thread_id"];
    this.#threadLastModified = threadObject["thread_last_modified"];
    this.#threadSubject = threadObject["thread_subject"];
    this.#threadTimestamp = threadObject["thread_timestamp"];
    this.#userId = threadObject["user_id"];
    if (typeof this.#threadId !== "number") {
      // Attempt to use the previous value of the this.#threadId instance field.
      return this.rebuildThreadFromThreadId(previousThreadId);
    }
    // this.#postId has to be a number or null.
    if (typeof this.#postId !== "number" && this.#postId !== null) {
      return this.rebuildThreadFromThreadId(this.#threadId);
    }
    // Unchecked: threadLastModified, threadSubject, threadTimestamp, userId.
    this.#retrievedThread = true;
    this.#threadSubjectElement.textContent = this.#threadSubject;
    // Display thread subject as soon as possible.
    this.#mainElement.appendChild(this.#threadSubjectElement);
    if (this.#postId === null) {
      return this.#finally();
    }
    const post = await retrievePost(this.#postId)
      .catch((error) => {
        console.error(error);
      });
    if (post === null) {
      return this.#finally();
    }
    this.#imageId = post["image_id"];
    this.#postText = post["post_text"];
    this.#retrievedPost = true;
    this.#postTextElement.textContent = this.#postText;
    // Display post text as soon as possible.
    this.#mainElement.appendChild(this.#postTextElement);
    if (this.#imageId === null) {
      return this.#finally();
    }
    const imageBlob = await retrieveImage(this.#imageId)
      .catch((error) => {
        console.error(error);
      });
    if (imageBlob === null) {
      return this.#finally();
    }
    this.#retrievedImage = true;
    this.#thumbnailElement.src = URL.createObjectURL(imageBlob);
    // Display thumbnail as soon as possible.
    this.#mainElement.appendChild(this.#thumbnailContainerElement);
    return this.#finally();
  }

  clearPosts() {
    while (this.#posts.length) {
      this.#posts.pop();
    }
  }

  hasThread() {
    return this.#retrievedThread; // Boolean.
  }

  hasPost() {
    return this.#retrievedPost; // Boolean.
  }

  hasImage() {
    return this.#retrievedImage; // Boolean.
  }

  isDone() {
    return this.#done; // Boolean
  }

  isVisible() {
    return !this.#hidden; // Boolean
  }

  getPostText() {
    return this.#postText;
  }

  getThreadLastModified() {
    return this.#threadLastModified;
  }

  getThreadSubject() {
    return this.#threadSubject;
  }

  getThreadTimestamp() {
    return this.#threadTimestamp;
  }

  getElement() {
    return this.#mainElement;
  }

  filterCompare(filterSearch, filterCriteria) {
    if (!this.#retrievedThread) {
      this.#hidden = true;
      return;
    }
    if (filterSearch === "" && filterCriteria !== "image") {
      this.#hidden = false;
      return;
    }
    const searchLC = filterSearch.toLowerCase();
    switch (filterCriteria) {
      case "image":
        if (this.#retrievedImage) {
          this.#hidden = false;
          return;
        }
        this.#hidden = true;
        return;
      case "last-modified":
        this.#hidden = false;
        return;
      case "subject":
        const subjectLC = this.#threadSubject.toLowerCase();
        if (subjectLC.includes(searchLC)) {
          this.#hidden = false;
          return;
        }
        this.#hidden = true;
        return;
      case "text":
        if (this.#retrievedPost) {
          const textLC = this.#postText.toLowerCase();
          if (textLC.includes(searchLC)) {
            this.#hidden = false;
            return;
          }
        }
        this.#hidden = true;
        return;
      case "timestamp":
        this.#hidden = false;
        return;
    }
    this.#hidden = false;
  }
}


class AddThreadHandler {
  // Private instance fields.
  #parent;
  #mainElement;
  #formElement;
  #inputFileElement;
  #thumbnailElement;
  #buttonStartElements;
  #buttonCancelElements;

  constructor(parent) {
    // parent is necessary for this.#parent.addThread(formData).
    // See implementation of handleEvent(event).
    this.#parent = parent;
    this.#mainElement = divAddThreadElement;
    this.#formElement = formAddThreadElement;
    this.#inputFileElement = inputFileAddThreadElement;
    this.#thumbnailElement = thumbnailAddThreadElement;
    this.#buttonStartElements = [];
    for (const element of buttonAddThreadElements) {
        this.#buttonStartElements.push(element);
    }
    this.#buttonCancelElements = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.#mainElement) {
        this.#buttonCancelElements.push(element);
      }
    }
    this.#formElement.onsubmit = (event) => {return false;};
    this.#formElement.addEventListener("submit", this);
    this.#inputFileElement.addEventListener("change", this);
    for (const element of this.#buttonStartElements) {
      element.addEventListener("click", this);
    }
    for (const element of this.#buttonCancelElements) {
      element.addEventListener("click", this);
    }
  }

  handleEvent(event) {
    if (event.target === this.#formElement) {
      if (event.type === "submit") {
        const formData = new FormData(this.#formElement);
        const threadValidationErrors = threadValidation(formData);
        if (threadValidationErrors === null) {
          // TODO(wathne): Make addThread async and await for success or error.
          this.#parent.addThread(formData);
          this.#mainElement.style.display = "none";
        } else {
          for (const error of threadValidationErrors) {
            // TODO: Message about invalid formData.
            console.log(error);
          }
        }
      }
    }
    if (event.target === this.#inputFileElement) {
      if (event.type === "change") {
        const formData = new FormData(this.#formElement);
        const dataObject = Object.fromEntries(formData);
        const imageFile = dataObject["image"];
        const previousURL = this.#thumbnailElement.src;
        if (previousURL !== pixelPNG && previousURL !== "") {
          this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
          URL.revokeObjectURL(previousURL); // Release previous file reference.
          console.log(`Revoked URL: "${previousURL}"`); // TODO: Delete.
        }
        this.#thumbnailElement.src = URL.createObjectURL(imageFile);
      }
    }
    for (const element of this.#buttonStartElements) {
      if (event.target === element) {
        if (event.type === "click") {
          this.#mainElement.style.display = "block";
        }
      }
    }
    for (const element of this.#buttonCancelElements) {
      if (event.target === element) {
        if (event.type === "click") {
          this.#mainElement.style.display = "none";
        }
      }
    }
  }
}


class FilterHandler {
  // Private instance fields.
  #parent;
  #search;
  #sortOrder;
  #criteria;

  constructor(parent) {
    // parent is necessary for this.#parent.filterThreads().
    // parent is necessary for this.#parent.sortThreads().
    // See implementation of handleEvent(event).
    this.#parent = parent;
    this.#search = filterSearchElement.value;
    this.#sortOrder = filterSortOrderElement.checked;
    this.#criteria = filterCriteriaElement.value;
    filterSearchElement.addEventListener("input", this);
    filterSortOrderElement.addEventListener("input", this);
    filterCriteriaElement.addEventListener("input", this);
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[FilterHandler] ` +
           `search: "${this.#search}", ` +
           `sortOrder: "${this.#sortOrder}", ` +
           `criteria: "${this.#criteria}"`;
  }

  getSearch() {
    return this.#search;
  }

  getSortOrder() {
    return this.#sortOrder;
  }

  getCriteria() {
    return this.#criteria;
  }

  handleEvent(event) {
    if (event.target === filterSearchElement) {
      if (event.type === "input") {
        this.#search = event.target.value;
        this.#parent.filterThreads();
      }
    }
    if (event.target === filterSortOrderElement) {
      if (event.type === "input") {
        this.#sortOrder = event.target.checked;
        this.#parent.sortThreads();
      }
    }
    if (event.target === filterCriteriaElement) {
      if (event.type === "input") {
        this.#criteria = event.target.value;
        this.#parent.sortThreads();
      }
    }
  }
}


class LoginCredential {
  constructor() {
    this.username = null;
    this.password = null;
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[LoginCredential] ` +
           `username: "${this.username}", ` +
           `password: "${this.password}"`;
  }
}


class RegisterHandler {
  // Private instance fields.
  #parent;
  #loginCredential;
  #mainElement;
  #formElement;
  #buttonStartElements;
  #buttonCancelElements;

  constructor(parent) {
    // parent is necessary for this.#parent.register().
    // See implementation of handleEvent(event).
    this.#parent = parent;
    this.#loginCredential = new LoginCredential();
    this.#mainElement = divRegisterElement;
    this.#formElement = formRegisterElement;
    this.#buttonStartElements = [];
    for (const element of buttonRegisterElements) {
        this.#buttonStartElements.push(element);
    }
    this.#buttonCancelElements = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.#mainElement) {
        this.#buttonCancelElements.push(element);
      }
    }
    this.#formElement.onsubmit = (event) => {return false;};
    this.#formElement.addEventListener("submit", this);
    for (const element of this.#buttonStartElements) {
      element.addEventListener("click", this);
    }
    for (const element of this.#buttonCancelElements) {
      element.addEventListener("click", this);
    }
  }

  getUsername() {
    return this.#loginCredential.username;
  }
  
  getPassword() {
    return this.#loginCredential.password;
  }

  handleEvent(event) {
    if (event.target === this.#formElement) {
      if (event.type === "submit") {
        const formData = new FormData(this.#formElement);
        const dataObject = Object.fromEntries(formData);
        this.#loginCredential.username = dataObject["username"];
        this.#loginCredential.password = dataObject["password"];
        console.log(this.#loginCredential.toHumanReadable()); // TODO: Delete.
        this.#parent.register()
          .then((success) => {
            if (success) {
              this.#mainElement.style.display = "none";
            } else {
              // TODO: Message about registration failure.
              console.log("TODO: Message about registration failure.");
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
          });
      }
    }
    for (const element of this.#buttonStartElements) {
      if (event.target === element) {
        if (event.type === "click") {
          this.#mainElement.style.display = "block";
        }
      }
    }
    for (const element of this.#buttonCancelElements) {
      if (event.target === element) {
        if (event.type === "click") {
          this.#mainElement.style.display = "none";
        }
      }
    }
  }
}


class LoginHandler {
  // Private instance fields.
  #parent;
  #loginCredential;
  #mainElement;
  #formElement;
  #buttonStartElements;
  #buttonCancelElements;

  constructor(parent) {
    // parent is necessary for this.#parent.login().
    // See implementation of handleEvent(event).
    this.#parent = parent;
    this.#loginCredential = new LoginCredential();
    this.#mainElement = divLoginElement;
    this.#formElement = formLoginElement;
    this.#buttonStartElements = [];
    for (const element of buttonLoginElements) {
        this.#buttonStartElements.push(element);
    }
    this.#buttonCancelElements = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.#mainElement) {
        this.#buttonCancelElements.push(element);
      }
    }
    this.#formElement.onsubmit = (event) => {return false;};
    this.#formElement.addEventListener("submit", this);
    for (const element of this.#buttonStartElements) {
      element.addEventListener("click", this);
    }
    for (const element of this.#buttonCancelElements) {
      element.addEventListener("click", this);
    }
  }

  getUsername() {
    return this.#loginCredential.username;
  }
  
  getPassword() {
    return this.#loginCredential.password;
  }

  handleEvent(event) {
    if (event.target === this.#formElement) {
      if (event.type === "submit") {
        const formData = new FormData(this.#formElement);
        const dataObject = Object.fromEntries(formData);
        this.#loginCredential.username = dataObject["username"];
        this.#loginCredential.password = dataObject["password"];
        console.log(this.#loginCredential.toHumanReadable()); // TODO: Delete.
        this.#parent.login()
          .then((success) => {
            if (success) {
              this.#mainElement.style.display = "none";
            } else {
              // TODO: Message about login failure.
              console.log("TODO: Message about login failure.");
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
          });
      }
    }
    for (const element of this.#buttonStartElements) {
      if (event.target === element) {
        if (event.type === "click") {
          this.#mainElement.style.display = "block";
        }
      }
    }
    for (const element of this.#buttonCancelElements) {
      if (event.target === element) {
        if (event.type === "click") {
          this.#mainElement.style.display = "none";
        }
      }
    }
  }
}


class LogoutHandler {
  // Private instance fields.
  #parent;
  #mainElement;
  #formElement;
  #buttonStartElements;
  #buttonCancelElements;

  constructor(parent) {
    // parent is necessary for this.#parent.logout().
    // See implementation of handleEvent(event).
    this.#parent = parent;
    this.#mainElement = divLogoutElement;
    this.#formElement = formLogoutElement;
    this.#buttonStartElements = [];
    for (const element of buttonLogoutElements) {
        this.#buttonStartElements.push(element);
    }
    this.#buttonCancelElements = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.#mainElement) {
        this.#buttonCancelElements.push(element);
      }
    }
    this.#formElement.onsubmit = (event) => {return false;};
    this.#formElement.addEventListener("submit", this);
    for (const element of this.#buttonStartElements) {
      element.addEventListener("click", this);
    }
    for (const element of this.#buttonCancelElements) {
      element.addEventListener("click", this);
    }
  }

  handleEvent(event) {
    if (event.target === this.#formElement) {
      if (event.type === "submit") {
        this.#parent.logout()
          .then((success) => {
            if (success) {
              this.#mainElement.style.display = "none";
            } else {
              // TODO: Message about logout failure.
              console.log("TODO: Message about logout failure.");
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
          });
      }
    }
    for (const element of this.#buttonStartElements) {
      if (event.target === element) {
        if (event.type === "click") {
          this.#mainElement.style.display = "block";
        }
      }
    }
    for (const element of this.#buttonCancelElements) {
      if (event.target === element) {
        if (event.type === "click") {
          this.#mainElement.style.display = "none";
        }
      }
    }
  }
}


class Imageboard {
  // Private instance fields.
  #threads;
  #threadsElement;
  #addThreadHandler;
  #filterHandler;
  #registerHandler;
  #loginHandler;
  #logoutHandler;

  constructor() {
    this.#threads = [];
    this.#threadsElement = divMainContentElement; // Threads container element.
    this.#addThreadHandler = new AddThreadHandler(this);
    this.#filterHandler = new FilterHandler(this);
    this.#registerHandler = new RegisterHandler(this);
    this.#loginHandler = new LoginHandler(this);
    this.#logoutHandler = new LogoutHandler(this);
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    const humanReadableThreads = [];
    for (const thread of this.#threads) {
      humanReadableThreads.push(thread.toHumanReadable());
    }
    return humanReadableThreads.join("\n");
  }

  addThread(formData) {
    const dataObject = Object.fromEntries(formData);
    const threadSubject = dataObject["subject"];
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    insertImage(imageFile)
      .then((imageId) => {
        if (imageId === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        return insertThread(threadSubject, postText, imageId);
      })
      .then((threadId) => {
        if (threadId === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        this.reloadThreads();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
      });
  }

  async reloadThreads() {
    console.log("reload threads"); // TODO: Delete.
    while (this.#threads.length) {
      this.#threads.pop();
    }
    const threads = await retrieveThreads()
      .catch((error) => {
        console.error(error);
      });
    if (threads === null) {
      return; // TODO(wathne): Proper reject/error handling.
    }
    const promises = threads
      .map(async (thread) => {
        return Thread.createThreadFromThreadObject(thread);
      });
    const settlements = await Promise.allSettled(promises)
      .catch((error) => {
        console.error(error);
      });
    for (const settlement of settlements) {
      if (settlement["status"] === "fulfilled") {
        const thread = settlement["value"];
        this.#threads.push(thread);
        console.log(thread.toHumanReadable());
      }
      if (settlement["status"] === "rejected") {
        console.log(settlement["reason"]);
      }
    }
    this.sortThreads();
  }

  sortThreads() {
    console.log("sort threads"); // TODO: Delete.
    const filterSortOrder = this.#filterHandler.getSortOrder();
    const filterCriteria = this.#filterHandler.getCriteria();
    function compareLastModified(a, b) {
      return b.getThreadLastModified() - a.getThreadLastModified();
    }
    function compareSubject(a, b) {
      return a.getThreadSubject().localeCompare(b.getThreadSubject());
    }
    function compareTimestamp(a, b) {
      return b.getThreadTimestamp() - a.getThreadTimestamp();
    }
    switch (filterCriteria) {
      case "last-modified":
        this.#threads.sort(compareLastModified);
        break;
      case "subject":
        this.#threads.sort(compareSubject);
        break;
      case "text":
        break;
      case "image":
        break;
      case "timestamp":
        this.#threads.sort(compareTimestamp);
        break;
    }
    if (filterSortOrder === false) {
      this.#threads.reverse();
    }
    this.filterThreads();
  }

  filterThreads() {
    console.log("filter threads"); // TODO: Delete.
    const filterSearch = this.#filterHandler.getSearch();
    const filterCriteria = this.#filterHandler.getCriteria();
    for (const thread of this.#threads) {
      thread.filterCompare(filterSearch, filterCriteria);
    }
    this.#showThreads();
  }

  // Private instance method.
  #showThreads() {
    console.log("show threads"); // TODO: Delete.
    while (this.#threadsElement.firstChild) {
      this.#threadsElement.removeChild(this.#threadsElement.firstChild);
    }
    for (const thread of this.#threads) {
      if (thread.isVisible()) {
        this.#threadsElement.appendChild(thread.getElement());
      }
    }
  }

  async register() {
    const username = this.#registerHandler.getUsername();
    const password = this.#registerHandler.getPassword();
    const userId = await sessionRegister(username, password);
    console.log(`register userId: ${userId}`); // TODO: Delete.
    this.reloadThreads();
    if (userId !== null) {
      return true;
    }
    return false;
  }

  async login() {
    const username = this.#loginHandler.getUsername();
    const password = this.#loginHandler.getPassword();
    const userId = await sessionLogin(username, password);
    console.log(`login userId: ${userId}`); // TODO: Delete.
    this.reloadThreads();
    if (userId !== null) {
      return true;
    }
    return false;
  }

  async logout() {
    const userId = await sessionLogout();
    console.log(`logout userId: ${userId}`); // TODO: Delete.
    this.reloadThreads();
    if (userId !== null) {
      return true;
    }
    return false;
  }
}

const imageboard = new Imageboard();
imageboard.reloadThreads();

