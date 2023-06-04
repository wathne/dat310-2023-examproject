/* Imageboard.
 * 
 * 
 * Load order:
 * -----------
 *   /static/api.js
 *   /static/form-validation.js
 *   /static/box.js
 *   /static/handler.js
 *   /static/imageboard.js <- YOU ARE HERE
 * 
 * 
 * To understand the code I would recommend that you study the class
 * hierarchy listed below. Skip to the bottom of the code to see how it
 * all begins. The primary purpose of any *Handler class is to
 * implement event handling. The primary purpose of any *Manager class
 * is to spawn *Handler classes and wait for calls.
 * 
 * 
 * Class hierarchy (simplified):
 * -----------------------------
 *   Imageboard
 *     > ThreadsManager
 *     |   > Thread Array
 *     |   |   > PostsManager (One for each Thread in Thread Array.)
 *     |   |       > Post Array
 *     |   |       > ShowPostsHandler
 *     |   |       > AddPostHandler
 *     |   |       > ModifyPostHandler
 *     |   |       > DeletePostHandler
 *     |   |       > FilterHandler
 *     |   > ShowThreadsHandler
 *     |   > AddThreadHandler
 *     |   > ModifyThreadHandler
 *     |   > DeleteThreadHandler
 *     |   > FilterHandler
 *     > SessionManager
 *         > RegisterHandler
 *         > LoginHandler
 *         > LogoutHandler
 * 
 * 
 * /static/api.js
 * Function overview:
 * ------------------
 *   sessionRegister(username, password)
 *   sessionLogin(username, password)
 *   sessionLogout()
 *   setSettings(settings)
 *   getSettings()
 *   insertImage(imageFile)
 *   retrieveImage(imageId)
 *   retrieveThumbnail(imageId)
 *   insertThread(threadSubject, postText, imageId)
 *   updateThread(threadId, threadSubject, postText, imageId)
 *   deleteThread(threadId)
 *   retrieveThread(threadId)
 *   retrieveThreads()
 *   insertPost(threadId, postText, imageId)
 *   insertPostV2(threadId, postText, imageId)
 *   updatePost(postId, postText, imageId)
 *   deletePost(postId)
 *   retrievePost(postId)
 *   retrievePosts(threadId)
 * 
 * 
 * /static/form-validation.js
 * Function overview:
 * ------------------
 *   userValidation(formData)
 *   threadValidation(formData)
 *     > imageValidation(imageFile)
 *   postValidation(formData)
 *     > imageValidation(imageFile)
 * 
 * 
 * /static/box.js
 * Constant overview:
 * ------------------
 *   pixelPNG
 * 
 * 
 * /static/box.js
 * Class overview:
 * ---------------
 *   ShowThreadsBox
 *   AddThreadBox
 *   ModifyThreadBox
 *   DeleteThreadBox
 *   ShowPostsBox
 *   AddPostBox
 *   ModifyPostBox
 *   DeletePostBox
 * 
 * 
 * /static/handler.js
 * Constant overview:
 * ------------------
 *   buttonCancelElements
 *   buttonRegisterElements
 *   buttonLoginElements
 *   buttonLogoutElements
 *   filterSearchElement
 *   filterSortOrderElement
 *   filterCriteriaElement
 *   divRegisterElement
 *   divLoginElement
 *   divLogoutElement
 *   formRegisterElement
 *   formLoginElement
 *   formLogoutElement
 * 
 * 
 * /static/handler.js
 * Class overview:
 * ---------------
 *   ShowThreadsHandler
 *   AddThreadHandler
 *   ModifyThreadHandler
 *   DeleteThreadHandler
 *   ShowPostsHandler
 *   AddPostHandler
 *   ModifyPostHandler
 *   DeletePostHandler
 *   FilterHandler
 *   RegisterHandler
 *   LoginHandler
 *   LogoutHandler
 * 
 * 
 * TODO(wathne): Store filter settings in cookie.
 * TODO(wathne): Fix duplicate display of Threads bug.
 * TODO(wathne): Make sure that the PostsManager is ok after a Thread rebuild.
 * TODO(wathne): Improve reloadList().
 * TODO(wathne): Delete testElement.
 * TODO(wathne): Delete "// TESTING".
 * TODO(wathne): Delete a few console.log() lines.
 */

"use strict";


// Elements by id.
// @Imageboard.
const divMainExtraElement = document.getElementById("main-extra");
// @Imageboard.
const divMainContentElement = document.getElementById("main-content");
// @Imageboard.
const divHeaderButtonsElement = document.getElementById("header-buttons");


class Thread {
  // Status.
  #retrievedThread;
  #retrievedPost;
  #retrievedImage;
  #done;
  #hidden;
  // Data.
  #imageId;
  #postId;
  #postText;
  #threadId;
  #threadLastModified;
  #threadSubject;
  #threadTimestamp;
  #userId;
  // Thread elements.
  #mainElement;
  #threadSubjectElement;
  #thumbnailContainerElement;
  #thumbnailElement;
  #postTextElement;
  #testElement; // TODO(wathne): Delete testElement.
  // Box container elements.
  #buttonsElement;
  #extraElement;
  // PostsManager elements.
  #postsButtonsElement;
  #postsExtraElement;
  #postsListElement;
  // PostsManager
  #postsManager;

  static async createThreadFromThreadId(threadId) {
    if (typeof threadId === "number") {
      return await new Thread()
          .rebuildThreadFromThreadId(threadId);
    }
    return null;
  }

  static async createThreadFromThreadObject(threadObject) {
    if (typeof threadObject === "object" && threadObject !== null) {
      return await new Thread()
          .rebuildThreadFromThreadObject(threadObject);
    }
    return null;
  }

  constructor() {
    // main
    this.#mainElement = document.createElement("div");
    this.#mainElement.className = "thread framed";
    // threadSubject
    this.#threadSubjectElement = document.createElement("div");
    this.#threadSubjectElement.className = "thread-subject";
    // thumbnailContainer
    this.#thumbnailContainerElement = document.createElement("div");
    this.#thumbnailContainerElement.className =
        "flex-centered thumbnail-container";
    // thumbnail
    this.#thumbnailElement = document.createElement("img");
    this.#thumbnailElement.className = "thumbnail";
    this.#thumbnailElement.alt = "";
    this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
    this.#thumbnailContainerElement.appendChild(this.#thumbnailElement);
    // postText
    this.#postTextElement = document.createElement("div");
    this.#postTextElement.className = "thread-text";
    // test // TODO(wathne): Delete testElement.
    this.#testElement = document.createElement("div");
    // buttons
    this.#buttonsElement = document.createElement("div");
    this.#buttonsElement.className = "";
    // extra
    this.#extraElement = document.createElement("div");
    this.#extraElement.className = "";
    // postsButtons
    this.#postsButtonsElement = document.createElement("div");
    this.#postsButtonsElement.className = "";
    // postsExtra
    this.#postsExtraElement = document.createElement("div");
    this.#postsExtraElement.className = "";
    // postsList
    this.#postsListElement = document.createElement("div");
    this.#postsListElement.className = "";
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

  #empty() {
    // Status.
    this.#retrievedThread = false;
    this.#retrievedPost = false;
    this.#retrievedImage = false;
    this.#done = false;
    this.#hidden = true;
    // Data.
    this.#imageId = null;
    this.#postId = null;
    this.#postText = null;
    this.#threadId = null;
    this.#threadLastModified = null;
    this.#threadSubject = null;
    this.#threadTimestamp = null;
    this.#userId = null;
  }

  #demolish() {
    while (this.#mainElement.firstChild) {
      this.#mainElement.removeChild(this.#mainElement.firstChild);
    }
    this.#threadSubjectElement.textContent = "";
    const previousURL = this.#thumbnailElement.src;
    if (previousURL !== pixelPNG && previousURL !== "") {
      this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
      URL.revokeObjectURL(previousURL); // Release previous file reference.
      // TODO(wathne): Delete the next line.
      console.log(`Revoked URL: "${previousURL}"`);
    }
    this.#postTextElement.textContent = "";
    this.#testElement.textContent = ""; // TODO(wathne): Delete testElement.
  }

  // TODO(wathne): Delete testElement.
  #appendTestElement() {
    this.#testElement.textContent = this.toHumanReadable();
    this.#mainElement.appendChild(this.#testElement);
  }

  #appendExtra() {
    this.#mainElement.appendChild(this.#buttonsElement);
    this.#mainElement.appendChild(this.#extraElement);
  }

  #appendPosts() {
    this.#mainElement.appendChild(this.#postsButtonsElement);
    this.#mainElement.appendChild(this.#postsExtraElement);
    this.#mainElement.appendChild(this.#postsListElement);
    this.#postsManager = new PostsManager(
        this.#threadId,
        this.#postsListElement,
        this.#postsExtraElement,
        this.#postsButtonsElement,
    );
  }

  #finally() {
    this.#appendTestElement(); // TODO(wathne): Delete testElement.
    this.#appendExtra();
    this.#appendPosts();
    this.#done = true;
    return this;
  }

  appendBox(box) {
    const button = box.createButton();
    const element = box.getMainElement();
    this.#buttonsElement.appendChild(button);
    this.#extraElement.appendChild(element);
  }

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
    const thread_and_posts = await retrieveThread(this.#threadId)
        .catch((error) => {
          console.error(error);
        });
    if (thread_and_posts === null) {
      return this.#finally();
    }
    const thread = thread_and_posts["thread"];
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

  getThreadId() {
    return this.#threadId;
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

  getMainElement() {
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


class ThreadsManager {
  #threads;
  // *Handler
  #showThreadsHandler;
  #addThreadHandler;
  #modifyThreadHandler;
  #deleteThreadHandler;
  #filterHandler;
  // List element.
  #threadsListElement;

  constructor(contentElement, extraElement, buttonsElement) {
    this.#threads = [];
    // *Handler
    this.#showThreadsHandler = new ShowThreadsHandler(this);
    this.#addThreadHandler = new AddThreadHandler(this);
    this.#modifyThreadHandler = new ModifyThreadHandler(this);
    this.#deleteThreadHandler = new DeleteThreadHandler(this);
    this.#filterHandler = new FilterHandler(this);
    // showThreads*
    const showThreadsBox = this.#showThreadsHandler.createBox();
    const showThreadsMainElement = showThreadsBox.getMainElement();
    const showThreadsButton = showThreadsBox.createButton();
    // addThread*
    const addThreadBox = this.#addThreadHandler.createBox();
    const addThreadMainElement = addThreadBox.getMainElement();
    const addThreadButton = addThreadBox.createButton();
    // Append elements.
    contentElement.appendChild(showThreadsMainElement);
    extraElement.appendChild(addThreadMainElement);
    buttonsElement.appendChild(showThreadsButton);
    buttonsElement.appendChild(addThreadButton);
    // List element.
    this.#threadsListElement = showThreadsBox.getListElement();
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    const humanReadableThreads = [];
    for (const thread of this.#threads) {
      humanReadableThreads.push(thread.toHumanReadable());
    }
    return humanReadableThreads.join("\n");
  }

  #createModifyThreadBox(thread) {
    thread.appendBox(this.#modifyThreadHandler.createBox(thread));
  }

  #createDeleteThreadBox(thread) {
    thread.appendBox(this.#deleteThreadHandler.createBox(thread));
  }

  async addThread(formData) {
    const dataObject = Object.fromEntries(formData);
    const threadSubject = dataObject["subject"];
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const imageId = await insertImage(imageFile)
          .catch((error) => {
            console.error(error);
          });
      if (typeof imageId !== "number") {
        return false; // TODO(wathne): Proper reject/error handling.
      }
      const threadId = await insertThread(threadSubject, postText, imageId)
          .catch((error) => {
            console.error(error);
          });
      if (typeof threadId === "number") {
        this.reloadList(); // Do not await.
        return true;
      }
      return false;
    }
    const threadId = await insertThread(threadSubject, postText, null)
        .catch((error) => {
          console.error(error);
        });
    if (typeof threadId === "number") {
      this.reloadList(); // Do not await.
      return true;
    }
    return false;
  }

  async modifyThread(formData, thread) {
    const threadId = thread.getThreadId();
    if (typeof threadId !== "number") {
      return false;
    }
    const dataObject = Object.fromEntries(formData);
    const threadSubject = dataObject["subject"];
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const imageId = await insertImage(imageFile)
          .catch((error) => {
            console.error(error);
          });
      if (typeof imageId !== "number") {
        return false; // TODO(wathne): Proper reject/error handling.
      }
      const responseCode = await updateThread(
          threadId,
          threadSubject,
          postText,
          imageId,
      )
          .catch((error) => {
            console.error(error);
          });
      if (typeof responseCode === "number" && responseCode === threadId) {
        this.reloadList(); // Do not await.
        return true;
      }
      return false;
    }
    const responseCode = await updateThread(
        threadId,
        threadSubject,
        postText,
        null,
    )
        .catch((error) => {
          console.error(error);
        });
    if (typeof responseCode === "number" && responseCode === threadId) {
      this.reloadList(); // Do not await.
      return true;
    }
    return false;
  }

  async deleteThread(thread) {
    const threadId = thread.getThreadId();
    if (typeof threadId !== "number") {
      return false;
    }
    const responseCode = await deleteThread(threadId)
        .catch((error) => {
          console.error(error);
        });
    if (typeof responseCode === "number" && responseCode === threadId) {
      this.reloadList(); // Do not await.
      return true;
    }
    return false;
  }

  async reloadList() {
    console.log("reload threads"); // TODO(wathne): Delete this line.
    while (this.#threads.length) {
      this.#threads.pop();
    }
    const threads = await retrieveThreads()
        .catch((error) => {
          console.error(error);
        });
    if (threads === null) {
      this.#showList();
      return false;
    }
    // TODO(wathne): Check Array.isArray?
    if (typeof threads !== "object") {
      return false; // TODO(wathne): Proper reject/error handling.
    }
    // TODO(wathne): Show incomplete threads for a more responsive experience.
    // TODO(wathne): Do not wait for slow promises.
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
    for (const thread of this.#threads) { // TESTING, temporary solution.
      this.#createModifyThreadBox(thread);
      this.#createDeleteThreadBox(thread);
    }
    this.sortList();
    return true;
  }

  sortList() {
    console.log("sort threads"); // TODO(wathne): Delete this line.
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
    this.filterList();
  }

  filterList() {
    console.log("filter threads"); // TODO(wathne): Delete this line.
    const filterSearch = this.#filterHandler.getSearch();
    const filterCriteria = this.#filterHandler.getCriteria();
    for (const thread of this.#threads) {
      thread.filterCompare(filterSearch, filterCriteria);
    }
    this.#showList();
  }

  #showList() {
    console.log("show threads"); // TODO(wathne): Delete this line.
    while (this.#threadsListElement.firstChild) {
      this.#threadsListElement.removeChild(this.#threadsListElement.firstChild);
    }
    for (const thread of this.#threads) {
      if (thread.isVisible()) {
        this.#threadsListElement.appendChild(thread.getMainElement());
      }
    }
  }
}


class Post {
  // Status.
  #retrievedPost;
  #retrievedImage;
  #done;
  #hidden;
  // Data.
  #imageId;
  #postId;
  #postLastModified;
  #postText;
  #postTimestamp;
  #threadId;
  #userId;
  // Post elements.
  #mainElement;
  #thumbnailContainerElement;
  #thumbnailElement;
  #postTextElement;
  #testElement; // TODO(wathne): Delete testElement.
  // Box container elements.
  #buttonsElement;
  #extraElement;

  static async createPostFromPostId(postId) {
    if (typeof postId === "number") {
      return await new Post()
          .rebuildPostFromPostId(postId);
    }
    return null;
  }

  static async createPostFromPostObject(postObject) {
    if (typeof postObject === "object" && postObject !== null) {
      return await new Post()
          .rebuildPostFromPostObject(postObject);
    }
    return null;
  }

  constructor() {
    // main
    this.#mainElement = document.createElement("div");
    this.#mainElement.className = "post framed";
    // thumbnailContainer
    this.#thumbnailContainerElement = document.createElement("div");
    this.#thumbnailContainerElement.className =
        "flex-centered thumbnail-container";
    // thumbnail
    this.#thumbnailElement = document.createElement("img");
    this.#thumbnailElement.className = "thumbnail";
    this.#thumbnailElement.alt = "";
    this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
    this.#thumbnailContainerElement.appendChild(this.#thumbnailElement);
    // postText
    this.#postTextElement = document.createElement("div");
    this.#postTextElement.className = "post-text";
    // test // TODO(wathne): Delete testElement.
    this.#testElement = document.createElement("div");
    // buttons
    this.#buttonsElement = document.createElement("div");
    this.#buttonsElement.className = "";
    // extra
    this.#extraElement = document.createElement("div");
    this.#extraElement.className = "";
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

  #empty() {
    // Status.
    this.#retrievedPost = false;
    this.#retrievedImage = false;
    this.#done = false;
    this.#hidden = true;
    // Data.
    this.#imageId = null;
    this.#postId = null;
    this.#postLastModified = null;
    this.#postText = null;
    this.#postTimestamp = null;
    this.#threadId = null;
    this.#userId = null;
  }

  #demolish() {
    while (this.#mainElement.firstChild) {
      this.#mainElement.removeChild(this.#mainElement.firstChild);
    }
    const previousURL = this.#thumbnailElement.src;
    if (previousURL !== pixelPNG && previousURL !== "") {
      this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
      URL.revokeObjectURL(previousURL); // Release previous file reference.
      // TODO(wathne): Delete the next line.
      console.log(`Revoked URL: "${previousURL}"`);
    }
    this.#postTextElement.textContent = "";
    this.#testElement.textContent = ""; // TODO(wathne): Delete testElement.
  }

  // TODO(wathne): Delete testElement.
  #appendTestElement() {
    this.#testElement.textContent = this.toHumanReadable();
    this.#mainElement.appendChild(this.#testElement);
  }

  #appendExtra() {
    this.#mainElement.appendChild(this.#buttonsElement);
    this.#mainElement.appendChild(this.#extraElement);
  }

  #finally() {
    this.#appendTestElement(); // TODO(wathne): Delete testElement.
    this.#appendExtra();
    this.#done = true;
    return this;
  }

  appendBox(box) {
    const button = box.createButton();
    const element = box.getMainElement();
    this.#buttonsElement.appendChild(button);
    this.#extraElement.appendChild(element);
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

  getPostId() {
    return this.#postId;
  }

  getPostLastModified() {
    return this.#postLastModified;
  }

  getPostTimestamp() {
    return this.#postTimestamp;
  }

  getMainElement() {
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


class PostsManager {
  #threadId;
  #posts;
  // *Handler
  #showPostsHandler;
  #addPostHandler;
  #modifyPostHandler;
  #deletePostHandler;
  #filterHandler;
  // List element.
  #postsListElement;

  constructor(threadId, contentElement, extraElement, buttonsElement) {
    this.#threadId = threadId;
    this.#posts = [];
    // *Handler
    this.#showPostsHandler = new ShowPostsHandler(this);
    this.#addPostHandler = new AddPostHandler(this);
    this.#modifyPostHandler = new ModifyPostHandler(this);
    this.#deletePostHandler = new DeletePostHandler(this);
    this.#filterHandler = new FilterHandler(this);
    // showPosts*
    const showPostsBox = this.#showPostsHandler.createBox();
    const showPostsMainElement = showPostsBox.getMainElement();
    const showPostsButton = showPostsBox.createButton();
    // addPost*
    const addPostBox = this.#addPostHandler.createBox();
    const addPostMainElement = addPostBox.getMainElement();
    const addPostButton = addPostBox.createButton();
    // Append elements.
    contentElement.appendChild(showPostsMainElement);
    extraElement.appendChild(addPostMainElement);
    buttonsElement.appendChild(showPostsButton);
    buttonsElement.appendChild(addPostButton);
    // List element.
    this.#postsListElement = showPostsBox.getListElement();
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    const humanReadablePosts = [];
    for (const post of this.#posts) {
      humanReadablePosts.push(post.toHumanReadable());
    }
    return humanReadablePosts.join("\n");
  }

  #createModifyPostBox(post) {
    post.appendBox(this.#modifyPostHandler.createBox(post));
  }

  #createDeletePostBox(post) {
    post.appendBox(this.#deletePostHandler.createBox(post));
  }

  async addPost(formData) {
    const threadId = this.#threadId;
    if (typeof threadId !== "number") {
      return false;
    }
    console.log(`threadId: ${threadId}`); // TESTING.
    const dataObject = Object.fromEntries(formData);
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    console.log(formData); // TESTING.
    if (imageFile instanceof File && imageFile.size !== 0) {
      const imageId = await insertImage(imageFile)
          .catch((error) => {
            console.error(error);
          });
      if (typeof imageId !== "number") {
        return false; // TODO(wathne): Proper reject/error handling.
      }
      const postId = await insertPost(threadId, postText, imageId)
          .catch((error) => {
            console.error(error);
          });
      if (typeof postId === "number") {
        this.reloadList(); // Do not await.
        return true;
      }
      return false;
    }
    const postId = await insertPost(threadId, postText, null)
        .catch((error) => {
          console.error(error);
        });
    if (typeof postId === "number") {
      this.reloadList(); // Do not await.
      return true;
    }
    return false;
  }

  async modifyPost(formData, post) {
    const postId = post.getPostId();
    if (typeof postId !== "number") {
      return false;
    }
    const dataObject = Object.fromEntries(formData);
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const imageId = await insertImage(imageFile)
          .catch((error) => {
            console.error(error);
          });
      if (typeof imageId !== "number") {
        return false; // TODO(wathne): Proper reject/error handling.
      }
      const responseCode = await updatePost(postId, postText, imageId)
          .catch((error) => {
            console.error(error);
          });
      if (typeof responseCode === "number" && responseCode === postId) {
        this.reloadList(); // Do not await.
        return true;
      }
      return false;
    }
    const responseCode = await updatePost(postId, postText, null)
        .catch((error) => {
          console.error(error);
        });
    if (typeof responseCode === "number" && responseCode === postId) {
      this.reloadList(); // Do not await.
      return true;
    }
    return false;
  }

  async deletePost(post) {
    const postId = post.getPostId();
    if (typeof postId !== "number") {
      return false;
    }
    const responseCode = await deletePost(postId)
        .catch((error) => {
          console.error(error);
        });
    if (typeof responseCode === "number" && responseCode === postId) {
      this.reloadList(); // Do not await.
      return true;
    }
    return false;
  }

  async reloadList() {
    console.log("reload posts"); // TODO(wathne): Delete this line.
    while (this.#posts.length) {
      this.#posts.pop();
    }
    const threadId = this.#threadId;
    if (typeof threadId !== "number") {
      this.#showList();
      return false;
    }
    const posts = await retrievePosts(threadId)
        .catch((error) => {
          console.error(error);
        });
    if (posts === null) {
      this.#showList();
      return false;
    }
    // TODO(wathne): Check Array.isArray?
    if (typeof posts !== "object") {
      return false; // TODO(wathne): Proper reject/error handling.
    }
    // TODO(wathne): Show incomplete posts for a more responsive experience.
    // TODO(wathne): Do not wait for slow promises.
    const promises = posts
        .map(async (post) => {
          return Post.createPostFromPostObject(post);
        });
    const settlements = await Promise.allSettled(promises)
        .catch((error) => {
          console.error(error);
        });
    for (const settlement of settlements) {
      if (settlement["status"] === "fulfilled") {
        const post = settlement["value"];
        this.#posts.push(post);
        console.log(post.toHumanReadable());
      }
      if (settlement["status"] === "rejected") {
        console.log(settlement["reason"]);
      }
    }
    for (const post of this.#posts) { // TESTING, temporary solution.
      this.#createModifyPostBox(post);
      this.#createDeletePostBox(post);
    }
    this.sortList();
    return true;
  }

  sortList() {
    console.log("sort posts"); // TODO(wathne): Delete this line.
    const filterSortOrder = this.#filterHandler.getSortOrder();
    const filterCriteria = this.#filterHandler.getCriteria();
    function compareLastModified(a, b) {
      return b.getPostLastModified() - a.getPostLastModified();
    }
    function compareTimestamp(a, b) {
      return b.getPostTimestamp() - a.getPostTimestamp();
    }
    switch (filterCriteria) {
      case "last-modified":
        this.#posts.sort(compareLastModified);
        break;
      case "subject":
        break;
      case "text":
        break;
      case "image":
        break;
      case "timestamp":
        this.#posts.sort(compareTimestamp);
        break;
    }
    if (filterSortOrder === false) {
      this.#posts.reverse();
    }
    this.filterList();
  }

  filterList() {
    console.log("filter posts"); // TODO(wathne): Delete this line.
    const filterSearch = this.#filterHandler.getSearch();
    const filterCriteria = this.#filterHandler.getCriteria();
    for (const post of this.#posts) {
      post.filterCompare(filterSearch, filterCriteria);
    }
    this.#showList();
  }

  #showList() {
    console.log("show posts"); // TODO(wathne): Delete this line.
    while (this.#postsListElement.firstChild) {
      this.#postsListElement.removeChild(this.#postsListElement.firstChild);
    }
    for (const post of this.#posts) {
      if (post.isVisible()) {
        this.#postsListElement.appendChild(post.getMainElement());
      }
    }
  }
}


class SessionCredential {
  constructor() {
    this.username = null;
    this.password = null;
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[SessionCredential] ` +
           `username: "${this.username}", ` +
           `password: "${this.password}"`;
  }
}


class SessionManager {
  #reloadFunction;
  #registerHandler;
  #loginHandler;
  #logoutHandler;

  constructor(reloadFunction) {
    this.#reloadFunction = reloadFunction;
    this.#registerHandler = new RegisterHandler(this);
    this.#loginHandler = new LoginHandler(this);
    this.#logoutHandler = new LogoutHandler(this);
  }

  async register(sessionCredential) {
    if (!(sessionCredential instanceof SessionCredential)) {
      return false;
    }
    const username = sessionCredential.username;
    const password = sessionCredential.password;
    if (username === null || password === null) {
      return false;
    }
    const userId = await sessionRegister(username, password)
        .catch((error) => {
          console.error(error);
        });
    // TODO(wathne): Delete the next line.
    console.log(`register userId: ${userId}`);
    this.#reloadFunction(); // Do not await.
    if (typeof userId === "number") {
      return true;
    }
    return false;
  }

  async login(sessionCredential) {
    if (!(sessionCredential instanceof SessionCredential)) {
      return false;
    }
    const username = sessionCredential.username;
    const password = sessionCredential.password;
    if (username === null || password === null) {
      return false;
    }
    const userId = await sessionLogin(username, password)
        .catch((error) => {
          console.error(error);
        });
    console.log(`login userId: ${userId}`); // TODO(wathne): Delete this line.
    this.#reloadFunction(); // Do not await.
    if (typeof userId === "number") {
      return true;
    }
    return false;
  }

  async logout() {
    const userId = await sessionLogout()
        .catch((error) => {
          console.error(error);
        });
    console.log(`logout userId: ${userId}`); // TODO(wathne): Delete this line.
    this.#reloadFunction(); // Do not await.
    if (typeof userId === "number") {
      return true;
    }
    return false;
  }
}


class Imageboard {
  #threadsManager;
  #sessionManager;

  constructor(
      contentElement,
      extraElement,
      buttonsElement,
  ) {
    this.#threadsManager = new ThreadsManager(
        contentElement,
        extraElement,
        buttonsElement,
    );
    this.#sessionManager = new SessionManager(this.#threadsManager.reloadList);
  }

  async reloadSettings() {
    console.log("Requesting settings from the secure cookie session ...");
    const settings = await getSettings();
    if (settings !== null) {
      console.log(settings);
      const filterCriteria = settings["filter-criteria"];
      const filterSortOrder = settings["filter-sort-order"];
      if (typeof filterCriteria === "string") {
        const filterCriteriaSet = new Set([
          "last-modified",
          "subject",
          "text",
          "image",
          "timestamp",
        ]);
        if (filterCriteriaSet.has(filterCriteria)) {
          console.log(`settings.filter-criteria = "${filterCriteria}".`);
          filterCriteriaElement.value = filterCriteria;
        }
      }
      if (typeof filterSortOrder === "boolean") {
        console.log(`settings.filter-sort-order = ${filterSortOrder}.`);
        filterSortOrderElement.checked = filterSortOrder;
      }
    }
  }

  async reloadList() {
    this.#threadsManager.reloadList(); // Do not await.
  }
}

const imageboard = new Imageboard(
    divMainContentElement,
    divMainExtraElement,
    divHeaderButtonsElement,
);
imageboard.reloadSettings();
//imageboard.reloadList(); // TESTING

