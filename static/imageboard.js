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


class Thread {
  static createThreadFromThreadId(threadId) {
    return new Thread(threadId, null);
  }
  static createThreadFromThreadObject(threadObject) {
    return new Thread(null, threadObject);
  }
  constructor(threadId, threadObject) {
    this.posts = [];
    this.mainElement = document.createElement("div");
    this.mainElement.className = "thread";
    this.threadSubjectElement = document.createElement("div");
    this.threadSubjectElement.className = "thread-subject";
    this.thumbnailContainerElement = document.createElement("div");
    this.thumbnailContainerElement.className = "thumbnail-container";
    this.thumbnailElement = document.createElement("img");
    this.thumbnailElement.className = "thumbnail";
    this.thumbnailContainerElement.appendChild(this.thumbnailElement);
    this.thumbnailElement.alt = "";
    this.thumbnailElement.src = pixelPNG; // Placeholder URL.
    this.postTextElement = document.createElement("div");
    this.postTextElement.className = "thread-text";
    this.testElement = document.createElement("div"); // TODO: Delete.
    // Thread.createThreadFromThreadObject(threadObject)
    if (typeof threadObject === "object" && threadObject !== null) {
      this.rebuildThreadFromThreadObject(threadObject);
      return this;
    }
    // Thread.createThreadFromThreadId(threadId)
    if (typeof threadId === "number") {
      this.rebuildThreadFromThreadId(threadId);
      return this;
    }
    // Fallback to empty/null instance fields.
    this.#empty();
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[Thread] ` +
           `imageId: "${this.imageId}", ` +
           `postId: "${this.postId}", ` +
           `postText: "${this.postText}", ` +
           `threadId: "${this.threadId}", ` +
           `threadLastModified: "${this.threadLastModified}", ` +
           `threadSubject: "${this.threadSubject}", ` +
           `threadTimestamp: "${this.threadTimestamp}", ` +
           `userId: "${this.userId}"`;
  }

  #empty() {
    this.retrievedThread = false;
    this.retrievedPost = false;
    this.retrievedImage = false;
    this.hidden = true;
    this.imageId = null;
    this.postId = null;
    this.postText = null;
    this.threadId = null;
    this.threadLastModified = null;
    this.threadSubject = null;
    this.threadTimestamp = null;
    this.userId = null;
  }

  #demolish() {
    while (this.mainElement.firstChild) {
      this.mainElement.removeChild(this.mainElement.firstChild);
    }
    this.threadSubjectElement.textContent = "";
    const previousURL = this.thumbnailElement.src;
    if (previousURL !== pixelPNG) {
      this.thumbnailElement.src = pixelPNG; // Placeholder URL.
      URL.revokeObjectURL(previousURL); // Release previous file reference.
      console.log(`Revoked URL: "${previousURL}"`); // TODO: Delete.
    }
    this.postTextElement.textContent = "";
    this.testElement.textContent = ""; // TODO: Delete.
  }

  // TODO(wathne): retrieveThread returns thread_and_posts, not thread, fix it.
  // Calling rebuildThreadFromThreadId() without a threadId argument will by
  // default attempt to use the existing threadId instance field.
  rebuildThreadFromThreadId(threadId) {
    const previousThreadId = typeof this.threadId === "number" ?
      this.threadId :
      null;
    this.#empty();
    this.#demolish();
    this.threadId = typeof threadId === "number" ?
      threadId :
      previousThreadId;
    if (this.threadId === null) {
      return;
    }
    retrieveThread(this.threadId)
      .then((thread) => {
        if (thread === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        this.postId = thread["post_id"];
        this.threadLastModified = thread["thread_last_modified"];
        this.threadSubject = thread["thread_subject"];
        this.threadTimestamp = thread["thread_timestamp"];
        this.userId = thread["user_id"];
        this.retrievedThread = true;
        this.threadSubjectElement.textContent = this.threadSubject;
        // Display thread subject as soon as possible.
        this.mainElement.appendChild(this.threadSubjectElement);
        if (this.postId === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        retrievePost(this.postId);
      })
      .then((post) => {
        if (post === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        this.imageId = post["image_id"];
        this.postText = post["post_text"];
        this.retrievedPost = true;
        this.postTextElement.textContent = this.postText;
        // Display post text as soon as possible.
        this.mainElement.appendChild(this.postTextElement);
        if (this.imageId === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        return retrieveImage(this.imageId);
      })
      .then((imageBlob) => {
        if (imageBlob === null) {
          console.log(`404, imageId: ${this.imageId}`);
          return null; // TODO(wathne): Proper reject/error handling.
        }
        this.retrievedImage = true;
        this.thumbnailElement.src = URL.createObjectURL(imageBlob);
        // Display thumbnail as soon as possible.
        this.mainElement.appendChild(this.thumbnailContainerElement);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        // TODO(wathne): Delete testElement.
        this.testElement.textContent = this.toHumanReadable();
        this.mainElement.appendChild(this.testElement);
      });
  }

  // Calling rebuildThreadFromThreadObject() without a threadObject argument
  // will by default attempt to use the existing threadId instance field.
  rebuildThreadFromThreadObject(threadObject) {
    const previousThreadId = typeof this.threadId === "number" ?
      this.threadId :
      null;
    this.#empty();
    this.#demolish();
    // Note: typeof null is "object". We need to explicitly check if null.
    if (typeof threadObject !== "object" || threadObject === null) {
      this.rebuildThreadFromThreadId(previousThreadId);
      return;
    }
    this.postId = threadObject["post_id"];
    this.threadId = threadObject["thread_id"];
    this.threadLastModified = threadObject["thread_last_modified"];
    this.threadSubject = threadObject["thread_subject"];
    this.threadTimestamp = threadObject["thread_timestamp"];
    this.userId = threadObject["user_id"];
    if (typeof this.threadId !== "number") {
      // Attempt to use the previous value of the threadId instance field.
      this.rebuildThreadFromThreadId(previousThreadId);
      return;
    }
    // this.postId has to be a number or null.
    if (typeof this.postId !== "number" && this.postId !== null) {
      this.rebuildThreadFromThreadId(this.threadId);
      return;
    }
    // Unchecked: threadLastModified, threadSubject, threadTimestamp, userId.
    this.retrievedThread = true;
    this.threadSubjectElement.textContent = this.threadSubject;
    // Display thread subject as soon as possible.
    this.mainElement.appendChild(this.threadSubjectElement);
    if (this.postId === null) {
      return;
    }
    retrievePost(this.postId)
      .then((post) => {
        if (post === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        this.imageId = post["image_id"];
        this.postText = post["post_text"];
        this.retrievedPost = true;
        this.postTextElement.textContent = this.postText;
        // Display post text as soon as possible.
        this.mainElement.appendChild(this.postTextElement);
        if (this.imageId === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        return retrieveImage(this.imageId);
      })
      .then((imageBlob) => {
        if (imageBlob === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        this.retrievedImage = true;
        this.thumbnailElement.src = URL.createObjectURL(imageBlob);
        // Display thumbnail as soon as possible.
        this.mainElement.appendChild(this.thumbnailContainerElement);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        // TODO(wathne): Delete testElement.
        this.testElement.textContent = this.toHumanReadable();
        this.mainElement.appendChild(this.testElement);
      });
  }

  clearPosts() {
    while (this.posts.length) {
      this.posts.pop();
    }
  }

  isVisible() {
    return !this.hidden;
  }

  getElement() {
    return this.mainElement;
  }

  filterCompare(filterSearch, filterCriteria) {
    if (!this.retrievedThread) {
      this.hidden = true;
      return;
    }
    if (filterSearch === "" && filterCriteria !== "image") {
      this.hidden = false;
      return;
    }
    const searchLC = filterSearch.toLowerCase();
    switch (filterCriteria) {
      case "image":
        if (this.retrievedImage) {
          this.hidden = false;
          return;
        }
        this.hidden = true;
        return;
      case "last-modified":
        this.hidden = false;
        return;
      case "subject":
        const subjectLC = this.threadSubject.toLowerCase();
        if (subjectLC.includes(searchLC)) {
          this.hidden = false;
          return;
        }
        this.hidden = true;
        return;
      case "text":
        if (this.retrievedPost) {
          const textLC = this.postText.toLowerCase();
          if (textLC.includes(searchLC)) {
            this.hidden = false;
            return;
          }
        }
        this.hidden = true;
        return;
      case "timestamp":
        this.hidden = false;
        return;
    }
    this.hidden = false;
  }
}


class Post {
  static createPostFromPostId(postId) {
    return new Post(postId, null);
  }
  static createPostFromPostObject(postObject) {
    return new Post(null, postObject);
  }
  constructor(postId, postObject) {
    this.mainElement = document.createElement("div");
    this.mainElement.className = "post";
    this.thumbnailContainerElement = document.createElement("div");
    this.thumbnailContainerElement.className = "thumbnail-container";
    this.thumbnailElement = document.createElement("img");
    this.thumbnailElement.className = "thumbnail";
    this.thumbnailContainerElement.appendChild(this.thumbnailElement);
    this.thumbnailElement.alt = "";
    this.thumbnailElement.src = pixelPNG; // Placeholder URL.
    this.postTextElement = document.createElement("div");
    this.postTextElement.className = "post-text";
    this.testElement = document.createElement("div"); // TODO: Delete.
    // Post.createPostFromPostObject(postObject)
    if (typeof postObject === "object" && postObject !== null) {
      this.rebuildPostFromPostObject(postObject);
      return this;
    }
    // Post.createPostFromPostId(postId)
    if (typeof postId === "number") {
      this.rebuildPostFromPostId(postId);
      return this;
    }
    // Fallback to empty/null instance fields.
    this.#empty();
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[Post] ` +
           `imageId: "${this.imageId}", ` +
           `postId: "${this.postId}", ` +
           `postLastModified: "${this.postLastModified}", ` +
           `postText: "${this.postText}", ` +
           `postTimestamp: "${this.postTimestamp}", ` +
           `threadId: "${this.threadId}", ` +
           `userId: "${this.userId}"`;
  }

  #empty() {
    this.retrievedPost = false;
    this.retrievedImage = false;
    this.hidden = true;
    this.imageId = null;
    this.postId = null;
    this.postLastModified = null;
    this.postText = null;
    this.postTimestamp = null;
    this.threadId = null;
    this.userId = null;
  }

  #demolish() {
    while (this.mainElement.firstChild) {
      this.mainElement.removeChild(this.mainElement.firstChild);
    }
    const previousURL = this.thumbnailElement.src;
    if (previousURL !== pixelPNG) {
      this.thumbnailElement.src = pixelPNG; // Placeholder URL.
      URL.revokeObjectURL(previousURL); // Release previous file reference.
      console.log(`Revoked URL: "${previousURL}"`); // TODO: Delete.
    }
    this.postTextElement.textContent = "";
    this.testElement.textContent = ""; // TODO: Delete.
  }

  // Calling rebuildPostFromPostId() without a postId argument will by default
  // attempt to use the existing postId instance field.
  rebuildPostFromPostId(postId) {
    const previousPostId = typeof this.postId === "number" ?
      this.postId :
      null;
    this.#empty();
    this.#demolish();
    this.postId = typeof postId === "number" ?
      postId :
      previousPostId;
    if (this.postId === null) {
      return;
    }
    retrievePost(this.postId)
      .then((post) => {
        if (post === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        this.imageId = post["image_id"];
        this.postLastModified = post["post_last_modified"];
        this.postText = post["post_text"];
        this.postTimestamp = post["post_timestamp"];
        this.threadId = post["thread_id"];
        this.userId = post["user_id"];
        this.retrievedPost = true;
        this.postTextElement.textContent = this.postText;
        // Display post text as soon as possible.
        this.mainElement.appendChild(this.postTextElement);
        if (this.imageId === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        return retrieveImage(this.imageId);
      })
      .then((imageBlob) => {
        if (imageBlob === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        this.retrievedImage = true;
        this.thumbnailElement.src = URL.createObjectURL(imageBlob);
        // Display thumbnail as soon as possible.
        this.mainElement.appendChild(this.thumbnailContainerElement);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        // TODO(wathne): Delete testElement.
        this.testElement.textContent = this.toHumanReadable();
        this.mainElement.appendChild(this.testElement);
      });
  }

  // Calling rebuildPostFromPostObject() without a postObject argument will by
  // default attempt to use the existing postId instance field.
  rebuildPostFromPostObject(postObject) {
    const previousPostId = typeof this.postId === "number" ?
      this.postId :
      null;
    this.#empty();
    this.#demolish();
    // Note: typeof null is "object". We need to explicitly check if null.
    if (typeof postObject !== "object" || postObject === null) {
      this.rebuildPostFromPostId(previousPostId);
      return;
    }
    this.imageId = postObject["image_id"];
    this.postId = postObject["post_id"];
    this.postLastModified = postObject["post_last_modified"];
    this.postText = postObject["post_text"];
    this.postTimestamp = postObject["post_timestamp"];
    this.threadId = postObject["thread_id"];
    this.userId = postObject["user_id"];
    if (typeof this.postId !== "number") {
      // Attempt to use the previous value of the postId instance field.
      this.rebuildPostFromPostId(previousPostId);
      return;
    }
    // this.imageId has to be a number or null.
    if (typeof this.imageId !== "number" && this.imageId !== null) {
      this.rebuildPostFromPostId(this.postId);
      return;
    }
    // Unchecked: postLastModified, postText, postTimestamp, threadId, userId.
    this.retrievedPost = true;
    this.postTextElement.textContent = this.postText;
    // Display post text as soon as possible.
    this.mainElement.appendChild(this.postTextElement);
    if (this.imageId === null) {
      return;
    }
    retrieveImage(this.imageId)
      .then((imageBlob) => {
        if (imageBlob === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        this.retrievedImage = true;
        this.thumbnailElement.src = URL.createObjectURL(imageBlob);
        // Display thumbnail as soon as possible.
        this.mainElement.appendChild(this.thumbnailContainerElement);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        // TODO(wathne): Delete testElement.
        this.testElement.textContent = this.toHumanReadable();
        this.mainElement.appendChild(this.testElement);
      });
  }

  isVisible() {
    return !this.hidden;
  }

  getElement() {
    return this.mainElement;
  }

  filterCompare(filterSearch, filterCriteria) {
    if (!this.retrievedPost) {
      this.hidden = true;
      return;
    }
    if (filterSearch === "" && filterCriteria !== "image") {
      this.hidden = false;
      return;
    }
    const searchLC = filterSearch.toLowerCase();
    switch (filterCriteria) {
      case "image":
        if (this.retrievedImage) {
          this.hidden = false;
          return;
        }
        this.hidden = true;
        return;
      case "last-modified":
        this.hidden = false;
        return;
      case "subject":
        this.hidden = false;
        return;
      case "text":
        const textLC = this.postText.toLowerCase();
        if (textLC.includes(searchLC)) {
          this.hidden = false;
          return;
        }
        this.hidden = true;
        return;
      case "timestamp":
        this.hidden = false;
        return;
    }
    this.hidden = false;
  }
}


class FilterHandler {
  constructor(parent) {
    // parent is necessary for this.parent.filterThreads().
    // parent is necessary for this.parent.sortThreads().
    // See implementation of handleEvent(event).
    this.parent = parent;

    this.search_ = filterSearchElement.value;
    this.sortOrder = filterSortOrderElement.checked;
    this.criteria = filterCriteriaElement.value;

    filterSearchElement.addEventListener("input", this);
    filterSortOrderElement.addEventListener("input", this);
    filterCriteriaElement.addEventListener("input", this);
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[FilterHandler] ` +
           `search: "${this.search_}", ` +
           `sortOrder: "${this.sortOrder}", ` +
           `criteria: "${this.criteria}"`;
  }

  getSearch() {
    return this.search_;
  }

  getSortOrder() {
    return this.sortOrder;
  }

  getCriteria() {
    return this.criteria;
  }

  handleEvent(event) {
    if (event.target === filterSearchElement) {
      if (event.type === "input") {
        this.search_ = event.target.value;
        this.parent.filterThreads();
      }
    }
    if (event.target === filterSortOrderElement) {
      if (event.type === "input") {
        this.sortOrder = event.target.checked;
        this.parent.sortThreads();
      }
    }
    if (event.target === filterCriteriaElement) {
      if (event.type === "input") {
        this.criteria = event.target.value;
        this.parent.sortThreads();
      }
    }
  }
}


class AddThreadHandler {
  constructor(parent) {
    // parent is necessary for this.parent.addThread(formData).
    // See implementation of handleEvent(event).
    this.parent = parent;

    this.div = divAddThreadElement;
    this.form = formAddThreadElement;
    this.inputFile = inputFileAddThreadElement;
    this.thumbnail = thumbnailAddThreadElement;
    this.buttonStart = [];
    for (const element of buttonAddThreadElements) {
        this.buttonStart.push(element);
    }
    this.buttonCancel = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.div) {
        this.buttonCancel.push(element);
      }
    }

    this.form.onsubmit = (event) => {return false;};
    this.form.addEventListener("submit", this);
    this.inputFile.addEventListener("change", this);
    for (const element of this.buttonStart) {
      element.addEventListener("click", this);
    }
    for (const element of this.buttonCancel) {
      element.addEventListener("click", this);
    }
  }

  handleEvent(event) {
    if (event.target === this.form) {
      if (event.type === "submit") {
        const formData = new FormData(this.form);
        const threadErrors = threadValidation(formData);
        if (threadErrors === null) {
          // TODO(wathne): Make addThread async and await for success or error.
          this.parent.addThread(formData);
          this.div.style.display = "none";
        } else {
          for (const threadError of threadErrors) {
            // TODO: Message about invalid formData.
            console.log(threadError);
          }
        }
      }
    }
    if (event.target === this.inputFile) {
      if (event.type === "change") {
        const formData = new FormData(this.form);
        const dataObject = Object.fromEntries(formData);
        const imageFile = dataObject["image"];
        const previousURL = this.thumbnail.src;
        this.thumbnail.src = pixelPNG; // Placeholder URL.
        URL.revokeObjectURL(previousURL); // Release previous URL.
        this.thumbnail.src = URL.createObjectURL(imageFile); // New URL.
      }
    }
    for (const element of this.buttonStart) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "block";
        }
      }
    }
    for (const element of this.buttonCancel) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "none";
        }
      }
    }
  }
}


class RegisterHandler {
  constructor(parent) {
    // See implementation of handleEvent(event).
    this.parent = parent;

    this.loginCredential = new LoginCredential();

    this.div = divRegisterElement;
    this.form = formRegisterElement;
    this.buttonStart = [];
    for (const element of buttonRegisterElements) {
        this.buttonStart.push(element);
    }
    this.buttonCancel = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.div) {
        this.buttonCancel.push(element);
      }
    }

    this.form.onsubmit = (event) => {return false;};
    this.form.addEventListener("submit", this);
    for (const element of this.buttonStart) {
      element.addEventListener("click", this);
    }
    for (const element of this.buttonCancel) {
      element.addEventListener("click", this);
    }
  }

  handleEvent(event) {
    if (event.target === this.form) {
      if (event.type === "submit") {
        const formData = new FormData(this.form);
        const dataObject = Object.fromEntries(formData);
        this.loginCredential.username = dataObject["username"];
        this.loginCredential.password = dataObject["password"];
        console.log(this.loginCredential.toHumanReadable()); // TODO: Delete.
        this.parent.register().then((success) => {
          if (success) {
            this.div.style.display = "none";
          } else {
            // TODO: Message about registration failure.
            console.log("TODO: Message about registration failure.");
          }
        });
      }
    }
    for (const element of this.buttonStart) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "block";
        }
      }
    }
    for (const element of this.buttonCancel) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "none";
        }
      }
    }
  }
}


class LoginHandler {
  constructor(parent) {
    // See implementation of handleEvent(event).
    this.parent = parent;

    this.loginCredential = new LoginCredential();

    this.div = divLoginElement;
    this.form = formLoginElement;
    this.buttonStart = [];
    for (const element of buttonLoginElements) {
        this.buttonStart.push(element);
    }
    this.buttonCancel = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.div) {
        this.buttonCancel.push(element);
      }
    }

    this.form.onsubmit = (event) => {return false;};
    this.form.addEventListener("submit", this);
    for (const element of this.buttonStart) {
      element.addEventListener("click", this);
    }
    for (const element of this.buttonCancel) {
      element.addEventListener("click", this);
    }
  }

  handleEvent(event) {
    if (event.target === this.form) {
      if (event.type === "submit") {
        const formData = new FormData(this.form);
        const dataObject = Object.fromEntries(formData);
        this.loginCredential.username = dataObject["username"];
        this.loginCredential.password = dataObject["password"];
        console.log(this.loginCredential.toHumanReadable()); // TODO: Delete.
        this.parent.login().then((success) => {
          if (success) {
            this.div.style.display = "none";
          } else {
            // TODO: Message about login failure.
            console.log("TODO: Message about login failure.");
          }
        });
      }
    }
    for (const element of this.buttonStart) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "block";
        }
      }
    }
    for (const element of this.buttonCancel) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "none";
        }
      }
    }
  }
}


class LogoutHandler {
  constructor(parent) {
    // See implementation of handleEvent(event).
    this.parent = parent;

    this.div = divLogoutElement;
    this.form = formLogoutElement;
    this.buttonStart = [];
    for (const element of buttonLogoutElements) {
        this.buttonStart.push(element);
    }
    this.buttonCancel = [];
    for (const element of buttonCancelElements) {
      if (element.parentElement === this.div) {
        this.buttonCancel.push(element);
      }
    }

    this.form.onsubmit = (event) => {return false;};
    this.form.addEventListener("submit", this);
    for (const element of this.buttonStart) {
      element.addEventListener("click", this);
    }
    for (const element of this.buttonCancel) {
      element.addEventListener("click", this);
    }
  }

  handleEvent(event) {
    if (event.target === this.form) {
      if (event.type === "submit") {
        this.parent.logout().then((success) => {
          if (success) {
            this.div.style.display = "none";
          } else {
            // TODO: Message about logout failure.
            console.log("TODO: Message about logout failure.");
          }
        });
      }
    }
    for (const element of this.buttonStart) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "block";
        }
      }
    }
    for (const element of this.buttonCancel) {
      if (event.target === element) {
        if (event.type === "click") {
          this.div.style.display = "none";
        }
      }
    }
  }
}


class Imageboard {
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

  reloadThreads() {
    console.log("reload threads"); // TODO: Delete.
    while (this.#threads.length) {
      this.#threads.pop();
    }
    retrieveThreads()
      .then((threads) => {
        if (threads === null) {
          return null; // TODO(wathne): Proper reject/error handling.
        }
        for (const thread of threads) {
          const newThread = Thread.createThreadFromThreadObject(thread);
          console.log(newThread.toHumanReadable()); // TODO: Delete.
          this.#threads.push(newThread);
        }
        this.sortThreads();
      });
  }

  sortThreads() {
    console.log("sort threads"); // TODO: Delete.
    const filterSortOrder = this.#filterHandler.getSortOrder();
    const filterCriteria = this.#filterHandler.getCriteria();
    function compareLastModified(a, b) {
      return a.threadLastModified - b.threadLastModified;
    }
    function compareSubject(a, b) {
      return a.threadSubject.localeCompare(b.threadSubject);
    }
    function compareText(a, b) {
      return a.postText.localeCompare(b.postText);
    }
    function compareTimestamp(a, b) {
      return a.threadTimestamp - b.threadTimestamp;
    }
    switch (filterCriteria) {
      case "last-modified":
        this.#threads.sort(compareLastModified);
        break;
      case "subject":
        this.#threads.sort(compareSubject);
        break;
      case "text":
        this.#threads.sort(compareText);
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
    const username = this.#registerHandler.loginCredential.username;
    const password = this.#registerHandler.loginCredential.password;
    const userId = await sessionRegister(username, password);
    console.log(`register userId: ${userId}`); // TODO: Delete.
    this.reloadThreads();
    if (userId !== null) {
      return true;
    }
    return false;
  }

  async login() {
    const username = this.#loginHandler.loginCredential.username;
    const password = this.#loginHandler.loginCredential.password;
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

