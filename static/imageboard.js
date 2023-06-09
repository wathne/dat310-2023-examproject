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
 *   retrieveUser(userId)
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
 *   RegisterBox
 *   LoginBox
 *   LogoutBox
 * 
 * 
 * /static/handler.js
 * Constant overview:
 * ------------------
 *   filterSearchElement
 *   filterSortOrderElement
 *   filterCriteriaElement
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
 *   RegisterHandler
 *   LoginHandler
 *   LogoutHandler
 *   FilterHandler
 * 
 * 
 * TODO(wathne): Enlarge image on mouseclick or mouseover.
 * TODO(wathne): Fix duplicate display of Threads bug. Create async call stack?
 * TODO(wathne): Improve reloadList().
 * TODO(wathne): Display post id.
 * TODO(wathne): Add clear image button.
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
  #retrievedUser;
  #done;
  #hidden;
  // Data.
  #imageId;
  #postId;
  #postLastModified;
  #postText;
  #postTimestamp;
  #threadId;
  #threadLastModified;
  #threadSubject;
  #threadTimestamp;
  #userId;
  #userName
  // Thread elements.
  #mainElement;
  #threadSubjectElement;
  #userNameElement;
  #floatContainerElement;
  #thumbnailContainerElement;
  #thumbnailElement;
  #postTextElement;
  #postLastModifiedElement;
  #postTimestampElement;
  #threadLastModifiedElement;
  #threadTimestampElement;
  #testElement;
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
    this.#mainElement.className = "thread rounded";
    // threadSubject
    this.#threadSubjectElement = document.createElement("div");
    this.#threadSubjectElement.className = "thread-subject";
    // userName
    this.#userNameElement = document.createElement("div");
    this.#userNameElement.className = "thread-user-name";
    // floatContainer
    this.#floatContainerElement = document.createElement("div");
    this.#floatContainerElement.className = "float-container";
    // thumbnailContainer
    this.#thumbnailContainerElement = document.createElement("div");
    this.#thumbnailContainerElement.className =
        "flex-centered thumbnail-container";
    // thumbnail
    this.#thumbnailElement = document.createElement("img");
    this.#thumbnailElement.className = "thumbnail";
    this.#thumbnailElement.alt = "";
    this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
    // postText
    this.#postTextElement = document.createElement("div");
    this.#postTextElement.className = "thread-post-text";
    // postLastModified
    this.#postLastModifiedElement = document.createElement("div");
    this.#postLastModifiedElement.className = "thread-post-last-modified";
    // postTimestamp
    this.#postTimestampElement = document.createElement("div");
    this.#postTimestampElement.className = "thread-post-timestamp";
    // threadLastModified
    this.#threadLastModifiedElement = document.createElement("div");
    this.#threadLastModifiedElement.className = "thread-last-modified";
    // threadTimestamp
    this.#threadTimestampElement = document.createElement("div");
    this.#threadTimestampElement.className = "thread-timestamp";
    // test
    this.#testElement = document.createElement("div");
    // buttons
    this.#buttonsElement = document.createElement("div");
    this.#buttonsElement.className = "thread-buttons";
    // extra
    this.#extraElement = document.createElement("div");
    this.#extraElement.className = "thread-extra";
    // postsButtons
    this.#postsButtonsElement = document.createElement("div");
    this.#postsButtonsElement.className = "thread-posts-buttons";
    // postsExtra
    this.#postsExtraElement = document.createElement("div");
    this.#postsExtraElement.className = "thread-posts-extra";
    // postsList
    this.#postsListElement = document.createElement("div");
    this.#postsListElement.className = "thread-posts-list";
    // Element structure.
    this.#mainElement.appendChild(this.#threadSubjectElement);
    this.#mainElement.appendChild(this.#userNameElement);
    this.#mainElement.appendChild(this.#floatContainerElement);
    this.#floatContainerElement.appendChild(this.#thumbnailContainerElement);
    this.#thumbnailContainerElement.appendChild(this.#thumbnailElement);
    this.#floatContainerElement.appendChild(this.#postTextElement);
    this.#mainElement.appendChild(this.#postLastModifiedElement);
    this.#mainElement.appendChild(this.#postTimestampElement);
    this.#mainElement.appendChild(this.#threadLastModifiedElement);
    this.#mainElement.appendChild(this.#threadTimestampElement);
    this.#mainElement.appendChild(this.#testElement);
    this.#mainElement.appendChild(this.#buttonsElement);
    this.#mainElement.appendChild(this.#extraElement);
    this.#mainElement.appendChild(this.#postsButtonsElement);
    this.#mainElement.appendChild(this.#postsExtraElement);
    this.#mainElement.appendChild(this.#postsListElement);
    // PostsManager
    this.#postsManager = new PostsManager(
        this,
        this.#postsListElement,
        this.#postsExtraElement,
        this.#postsButtonsElement,
    );
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[Thread] ` +
           `imageId: "${this.#imageId}", ` +
           `postId: "${this.#postId}", ` +
           `postLastModified: "${this.#postLastModified}", ` +
           `postText: "${this.#postText}", ` +
           `postTimestamp: "${this.#postTimestamp}", ` +
           `threadId: "${this.#threadId}", ` +
           `threadLastModified: "${this.#threadLastModified}", ` +
           `threadSubject: "${this.#threadSubject}", ` +
           `threadTimestamp: "${this.#threadTimestamp}", ` +
           `userId: "${this.#userId}", ` +
           `userName: "${this.#userName}"`;
  }

  #empty() {
    // Status.
    this.#retrievedThread = false;
    this.#retrievedPost = false;
    this.#retrievedImage = false;
    this.#retrievedUser = false;
    this.#done = false;
    this.#hidden = true;
    // Data.
    this.#imageId = null;
    this.#postId = null;
    this.#postLastModified = null;
    this.#postText = null;
    this.#postTimestamp = null;
    this.#threadId = null;
    this.#threadLastModified = null;
    this.#threadSubject = null;
    this.#threadTimestamp = null;
    this.#userId = null;
    this.#userName = null;
  }

  #demolish() {
    for (const child of this.#mainElement.children) {
      child.style.display = "none";
    }
    for (const child of this.#floatContainerElement.children) {
      child.style.display = "none";
    }
    this.#floatContainerElement.style.minHeight = "0px";
    this.#floatContainerElement.style.display = "block";
    this.#threadSubjectElement.textContent = "";
    this.#userNameElement.textContent = "";
    const previousURL = this.#thumbnailElement.src;
    if (previousURL !== pixelPNG && previousURL !== "") {
      this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
      URL.revokeObjectURL(previousURL); // Release previous file reference.
      // TODO(wathne): Delete the next line.
      console.log(`Revoked URL: "${previousURL}"`);
    }
    this.#postTextElement.textContent = "";
    this.#postLastModifiedElement.textContent = "";
    this.#postTimestampElement.textContent = "";
    this.#threadLastModifiedElement.textContent = "";
    this.#threadTimestampElement.textContent = "";
    this.#testElement.textContent = "";
  }

  #displayTestElement() {
    this.#testElement.textContent = this.toHumanReadable();
    this.#testElement.style.display = "block";
  }

  #displayExtra() {
    this.#buttonsElement.style.display = "block";
    this.#extraElement.style.display = "block";
  }

  #displayPosts() {
    this.#postsButtonsElement.style.display = "block";
    this.#postsExtraElement.style.display = "block";
    this.#postsListElement.style.display = "block";
  }

  #finally() {
    //this.#displayTestElement();
    this.#displayExtra();
    this.#displayPosts();
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
    if (thread_and_posts["code"] !== undefined) {
      return this.#finally();
    }
    // TODO(wathne): Use the included list of posts to quickly rebuild posts.
    //const posts = thread_and_posts["posts"];
    const thread = thread_and_posts["thread"];
    this.#postId = thread["post_id"];
    this.#threadLastModified = thread["thread_last_modified"];
    this.#threadSubject = thread["thread_subject"];
    this.#threadTimestamp = thread["thread_timestamp"];
    this.#userId = thread["user_id"];
    this.#retrievedThread = true;
    this.#threadLastModifiedElement.textContent =
        `Thread updated: ${new Date(this.#threadLastModified * 1000)}`;
    this.#threadLastModifiedElement.style.display = "block";
    this.#threadSubjectElement.textContent = this.#threadSubject;
    this.#threadSubjectElement.style.display = "block";
    this.#threadTimestampElement.textContent =
        `Thread created: ${new Date(this.#threadTimestamp * 1000)}`;
    this.#threadTimestampElement.style.display = "block";
    if (this.#postId === null) {
      return this.#finally();
    }
    const post = await retrievePost(this.#postId)
        .catch((error) => {
          console.error(error);
        });
    if (post["code"] !== undefined) {
      return this.#finally();
    }
    this.#imageId = post["image_id"];
    this.#postLastModified = post["post_last_modified"];
    this.#postText = post["post_text"];
    this.#postTimestamp = post["post_timestamp"];
    this.#retrievedPost = true;
    this.#postLastModifiedElement.textContent =
        `Post updated: ${new Date(this.#postLastModified * 1000)}`;
    this.#postLastModifiedElement.style.display = "block";
    this.#postTextElement.textContent = this.#postText;
    this.#postTextElement.style.display = "block";
    this.#postTimestampElement.textContent =
        `Post created: ${new Date(this.#postTimestamp * 1000)}`;
    this.#postTimestampElement.style.display = "block";
    // TODO(wathne): Fetch user and imageBlob in async parallel.
    const user = await retrieveUser(this.#userId)
        .catch((error) => {
          console.error(error);
        });
    if (user["code"] !== undefined) {
      return this.#finally();
    }
    this.#userName = user["user_name"];
    this.#retrievedUser = true;
    this.#userNameElement.textContent = `Username: ${this.#userName}`;
    this.#userNameElement.style.display = "block";
    if (this.#imageId === null) {
      return this.#finally();
    }
    const imageBlob = await retrieveImage(this.#imageId)
        .catch((error) => {
          console.error(error);
        });
    if (imageBlob["code"] !== undefined) {
      return this.#finally();
    }
    this.#retrievedImage = true;
    this.#thumbnailElement.src = URL.createObjectURL(imageBlob);
    // TODO(wathne): Make this more dynamic/robust, not fixed to 120px.
    this.#floatContainerElement.style.minHeight = "120px";
    this.#thumbnailContainerElement.style.display = "block";
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
    this.#threadLastModifiedElement.textContent =
        `Thread updated: ${new Date(this.#threadLastModified * 1000)}`;
    this.#threadLastModifiedElement.style.display = "block";
    this.#threadSubjectElement.textContent = this.#threadSubject;
    this.#threadSubjectElement.style.display = "block";
    this.#threadTimestampElement.textContent =
        `Thread created: ${new Date(this.#threadTimestamp * 1000)}`;
    this.#threadTimestampElement.style.display = "block";
    if (this.#postId === null) {
      return this.#finally();
    }
    const post = await retrievePost(this.#postId)
        .catch((error) => {
          console.error(error);
        });
    if (post["code"] !== undefined) {
      return this.#finally();
    }
    this.#imageId = post["image_id"];
    this.#postLastModified = post["post_last_modified"];
    this.#postText = post["post_text"];
    this.#postTimestamp = post["post_timestamp"];
    this.#retrievedPost = true;
    this.#postLastModifiedElement.textContent =
        `Post updated: ${new Date(this.#postLastModified * 1000)}`;
    this.#postLastModifiedElement.style.display = "block";
    this.#postTextElement.textContent = this.#postText;
    this.#postTextElement.style.display = "block";
    this.#postTimestampElement.textContent =
        `Post created: ${new Date(this.#postTimestamp * 1000)}`;
    this.#postTimestampElement.style.display = "block";
    // TODO(wathne): Fetch user and imageBlob in async parallel.
    const user = await retrieveUser(this.#userId)
        .catch((error) => {
          console.error(error);
        });
    if (user["code"] !== undefined) {
      return this.#finally();
    }
    this.#userName = user["user_name"];
    this.#retrievedUser = true;
    this.#userNameElement.textContent = `Username: ${this.#userName}`;
    this.#userNameElement.style.display = "block";
    if (this.#imageId === null) {
      return this.#finally();
    }
    const imageBlob = await retrieveImage(this.#imageId)
        .catch((error) => {
          console.error(error);
        });
    if (imageBlob["code"] !== undefined) {
      return this.#finally();
    }
    this.#retrievedImage = true;
    this.#thumbnailElement.src = URL.createObjectURL(imageBlob);
    // TODO(wathne): Make this more dynamic/robust, not fixed to 120px.
    this.#floatContainerElement.style.minHeight = "120px";
    this.#thumbnailContainerElement.style.display = "block";
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

  hasUser() {
    return this.#retrievedUser; // Boolean.
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

  getUserName() {
    return this.#userName;
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
      case "image":
        if (this.#retrievedImage) {
          this.#hidden = false;
          return;
        }
        this.#hidden = true;
        return;
      case "username":
        if (this.#retrievedUser) {
          const usernameLC = this.#userName.toLowerCase();
          if (usernameLC.includes(searchLC)) {
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
  // This will allow a SessionManager to trigger the showThreadsBox on login.
  #showThreadsTriggerFunction;

  constructor(contentElement, extraElement, buttonsElement) {
    this.#threads = [];
    // *Handler
    this.#showThreadsHandler = new ShowThreadsHandler(
        this.reloadList.bind(this));
    this.#addThreadHandler = new AddThreadHandler(
        this.addThread.bind(this));
    this.#modifyThreadHandler = new ModifyThreadHandler(
        this.modifyThread.bind(this));
    this.#deleteThreadHandler = new DeleteThreadHandler(
        this.deleteThread.bind(this));
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
    // This will allow a SessionManager to trigger the showThreadsBox on login.
    this.#showThreadsTriggerFunction = showThreadsButton.dispatchEvent
        .bind(showThreadsButton, new Event("click"));
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

  // This will allow a SessionManager to trigger the showThreadsBox on login.
  getShowThreadsTriggerFunction() {
    return this.#showThreadsTriggerFunction;
  }

  async addThread(formData) {
    const dataObject = Object.fromEntries(formData);
    const threadSubject = dataObject["subject"];
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const insertImageStatus = await insertImage(imageFile)
          .catch((error) => {
            console.error(error);
          });
      if (insertImageStatus["code"] !== undefined) {
        return insertImageStatus;
      }
      const insertThreadStatus = await insertThread(
          threadSubject,
          postText,
          insertImageStatus,
      )
          .catch((error) => {
            console.error(error);
          });
      if (insertThreadStatus["code"] === undefined) {
        this.reloadList(); // Do not await.
      }
      return insertThreadStatus;
    }
    const insertThreadStatus = await insertThread(
        threadSubject,
        postText,
        null,
    )
        .catch((error) => {
          console.error(error);
        });
    if (insertThreadStatus["code"] === undefined) {
      this.reloadList(); // Do not await.
    }
    return insertThreadStatus;
  }

  async modifyThread(formData, thread) {
    const threadId = thread.getThreadId();
    if (typeof threadId !== "number") {
      return {
        code: 1336,
        description: "We have lost the thread_id, please reload and try again.",
        name: "BadJavascript",
      };
    }
    const dataObject = Object.fromEntries(formData);
    const threadSubject = dataObject["subject"];
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const insertImageStatus = await insertImage(imageFile)
          .catch((error) => {
            console.error(error);
          });
      if (insertImageStatus["code"] !== undefined) {
        return insertImageStatus;
      }
      const updateThreadStatus = await updateThread(
          threadId,
          threadSubject,
          postText,
          insertImageStatus,
      )
          .catch((error) => {
            console.error(error);
          });
      if (
          updateThreadStatus["code"] === undefined &&
          updateThreadStatus === threadId
      ) {
        this.reloadList(); // Do not await.
      }
      return updateThreadStatus;
    }
    const updateThreadStatus = await updateThread(
        threadId,
        threadSubject,
        postText,
        null,
    )
        .catch((error) => {
          console.error(error);
        });
    if (
        updateThreadStatus["code"] === undefined &&
        updateThreadStatus === threadId
    ) {
      this.reloadList(); // Do not await.
    }
    return updateThreadStatus;
  }

  async deleteThread(thread) {
    const threadId = thread.getThreadId();
    if (typeof threadId !== "number") {
      return {
        code: 1336,
        description: "We have lost the thread_id, please reload and try again.",
        name: "BadJavascript",
      };
    }
    const deleteThreadStatus = await deleteThread(threadId)
        .catch((error) => {
          console.error(error);
        });
    if (
        deleteThreadStatus["code"] === undefined &&
        deleteThreadStatus === threadId
    ) {
      this.reloadList(); // Do not await.
    }
    return deleteThreadStatus;
  }

  async reloadList() {
    console.log("reload threads"); // TODO(wathne): Delete this line.
    while (this.#threads.length) {
      this.#threads.pop();
    }
    const retrieveThreadsStatus = await retrieveThreads()
        .catch((error) => {
          console.error(error);
        });
    if (retrieveThreadsStatus["code"] !== undefined) {
      this.#showList();
      return retrieveThreadsStatus;
    }
    // TODO(wathne): Show incomplete threads for a more responsive experience.
    // TODO(wathne): Do not wait for slow promises.
    // TODO(wathne): Timer and Promise.race()?
    const promises = retrieveThreadsStatus
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
    for (const thread of this.#threads) {
      this.#createModifyThreadBox(thread);
      this.#createDeleteThreadBox(thread);
    }
    this.sortList();
    return {};
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
  #retrievedUser;
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
  #userName;
  // Post elements.
  #mainElement;
  #userNameElement;
  #floatContainerElement;
  #thumbnailContainerElement;
  #thumbnailElement;
  #postTextElement;
  #postLastModifiedElement;
  #postTimestampElement;
  #testElement;
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
    this.#mainElement.className = "post rounded";
    // userName
    this.#userNameElement = document.createElement("div");
    this.#userNameElement.className = "post-user-name";
    // floatContainer
    this.#floatContainerElement = document.createElement("div");
    this.#floatContainerElement.className = "float-container";
    // thumbnailContainer
    this.#thumbnailContainerElement = document.createElement("div");
    this.#thumbnailContainerElement.className =
        "flex-centered thumbnail-container";
    // thumbnail
    this.#thumbnailElement = document.createElement("img");
    this.#thumbnailElement.className = "thumbnail";
    this.#thumbnailElement.alt = "";
    this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
    // postText
    this.#postTextElement = document.createElement("div");
    this.#postTextElement.className = "post-text";
    // postLastModified
    this.#postLastModifiedElement = document.createElement("div");
    this.#postLastModifiedElement.className = "post-last-modified";
    // postTimestamp
    this.#postTimestampElement = document.createElement("div");
    this.#postTimestampElement.className = "post-timestamp";
    // test
    this.#testElement = document.createElement("div");
    // buttons
    this.#buttonsElement = document.createElement("div");
    this.#buttonsElement.className = "post-buttons";
    // extra
    this.#extraElement = document.createElement("div");
    this.#extraElement.className = "post-extra";
    // Element structure.
    this.#mainElement.appendChild(this.#userNameElement);
    this.#mainElement.appendChild(this.#floatContainerElement);
    this.#floatContainerElement.appendChild(this.#thumbnailContainerElement);
    this.#thumbnailContainerElement.appendChild(this.#thumbnailElement);
    this.#floatContainerElement.appendChild(this.#postTextElement);
    this.#mainElement.appendChild(this.#postLastModifiedElement);
    this.#mainElement.appendChild(this.#postTimestampElement);
    this.#mainElement.appendChild(this.#testElement);
    this.#mainElement.appendChild(this.#buttonsElement);
    this.#mainElement.appendChild(this.#extraElement);
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
           `userId: "${this.#userId}", ` +
           `userName: "${this.#userName}"`;
  }

  #empty() {
    // Status.
    this.#retrievedPost = false;
    this.#retrievedImage = false;
    this.#retrievedUser = false;
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
    this.#userName = null;
  }

  #demolish() {
    for (const child of this.#mainElement.children) {
      child.style.display = "none";
    }
    for (const child of this.#floatContainerElement.children) {
      child.style.display = "none";
    }
    this.#floatContainerElement.style.minHeight = "0px";
    this.#floatContainerElement.style.display = "block";
    this.#userNameElement.textContent = "";
    const previousURL = this.#thumbnailElement.src;
    if (previousURL !== pixelPNG && previousURL !== "") {
      this.#thumbnailElement.src = pixelPNG; // Placeholder URL.
      URL.revokeObjectURL(previousURL); // Release previous file reference.
      // TODO(wathne): Delete the next line.
      console.log(`Revoked URL: "${previousURL}"`);
    }
    this.#postTextElement.textContent = "";
    this.#postLastModifiedElement.textContent = "";
    this.#postTimestampElement.textContent = "";
    this.#testElement.textContent = "";
  }

  #displayTestElement() {
    this.#testElement.textContent = this.toHumanReadable();
    this.#testElement.style.display = "block";
  }

  #displayExtra() {
    this.#buttonsElement.style.display = "block";
    this.#extraElement.style.display = "block";
  }

  #finally() {
    //this.#displayTestElement();
    this.#displayExtra();
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
    if (post["code"] !== undefined) {
      return this.#finally();
    }
    this.#imageId = post["image_id"];
    this.#postLastModified = post["post_last_modified"];
    this.#postText = post["post_text"];
    this.#postTimestamp = post["post_timestamp"];
    this.#threadId = post["thread_id"];
    this.#userId = post["user_id"];
    this.#retrievedPost = true;
    this.#postLastModifiedElement.textContent =
        `Post updated: ${new Date(this.#postLastModified * 1000)}`;
    this.#postLastModifiedElement.style.display = "block";
    this.#postTextElement.textContent = this.#postText;
    this.#postTextElement.style.display = "block";
    this.#postTimestampElement.textContent =
        `Post created: ${new Date(this.#postTimestamp * 1000)}`;
    this.#postTimestampElement.style.display = "block";
    // TODO(wathne): Fetch user and imageBlob in async parallel.
    const user = await retrieveUser(this.#userId)
        .catch((error) => {
          console.error(error);
        });
    if (user["code"] !== undefined) {
      return this.#finally();
    }
    this.#userName = user["user_name"];
    this.#retrievedUser = true;
    this.#userNameElement.textContent = `Username: ${this.#userName}`;
    this.#userNameElement.style.display = "block";
    if (this.#imageId === null) {
      return this.#finally();
    }
    const imageBlob = await retrieveImage(this.#imageId)
        .catch((error) => {
          console.error(error);
        });
    if (imageBlob["code"] !== undefined) {
      return this.#finally();
    }
    this.#retrievedImage = true;
    this.#thumbnailElement.src = URL.createObjectURL(imageBlob);
    // TODO(wathne): Make this more dynamic/robust, not fixed to 120px.
    this.#floatContainerElement.style.minHeight = "120px";
    this.#thumbnailContainerElement.style.display = "block";
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
    this.#postLastModifiedElement.textContent =
        `Post updated: ${new Date(this.#postLastModified * 1000)}`;
    this.#postLastModifiedElement.style.display = "block";
    this.#postTextElement.textContent = this.#postText;
    this.#postTextElement.style.display = "block";
    this.#postTimestampElement.textContent =
        `Post created: ${new Date(this.#postTimestamp * 1000)}`;
    this.#postTimestampElement.style.display = "block";
    // TODO(wathne): Fetch user and imageBlob in async parallel.
    const user = await retrieveUser(this.#userId)
        .catch((error) => {
          console.error(error);
        });
    if (user["code"] !== undefined) {
      return this.#finally();
    }
    this.#userName = user["user_name"];
    this.#retrievedUser = true;
    this.#userNameElement.textContent = `Username: ${this.#userName}`;
    this.#userNameElement.style.display = "block";
    if (this.#imageId === null) {
      return this.#finally();
    }
    const imageBlob = await retrieveImage(this.#imageId)
        .catch((error) => {
          console.error(error);
        });
    if (imageBlob["code"] !== undefined) {
      return this.#finally();
    }
    this.#retrievedImage = true;
    this.#thumbnailElement.src = URL.createObjectURL(imageBlob);
    // TODO(wathne): Make this more dynamic/robust, not fixed to 120px.
    this.#floatContainerElement.style.minHeight = "120px";
    this.#thumbnailContainerElement.style.display = "block";
    return this.#finally();
  }

  hasPost() {
    return this.#retrievedPost; // Boolean.
  }

  hasImage() {
    return this.#retrievedImage; // Boolean.
  }

  hasUser() {
    return this.#retrievedUser; // Boolean.
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

  getUserName() {
    return this.#userName;
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
      case "image":
        if (this.#retrievedImage) {
          this.#hidden = false;
          return;
        }
        this.#hidden = true;
        return;
      case "username":
        if (this.#retrievedUser) {
          const usernameLC = this.#userName.toLowerCase();
          if (usernameLC.includes(searchLC)) {
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


class PostsManager {
  #thread;
  #posts;
  // *Handler
  #showPostsHandler;
  #addPostHandler;
  #modifyPostHandler;
  #deletePostHandler;
  #filterHandler;
  // List element.
  #postsListElement;

  constructor(thread, contentElement, extraElement, buttonsElement) {
    this.#thread = thread;
    this.#posts = [];
    // *Handler
    this.#showPostsHandler = new ShowPostsHandler(
        this.reloadList.bind(this));
    this.#addPostHandler = new AddPostHandler(
        this.addPost.bind(this));
    this.#modifyPostHandler = new ModifyPostHandler(
        this.modifyPost.bind(this));
    this.#deletePostHandler = new DeletePostHandler(
        this.deletePost.bind(this));
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
    const threadId = this.#thread.getThreadId();
    if (typeof threadId !== "number") {
      return {
        code: 1336,
        description: "We have lost the thread_id, please reload and try again.",
        name: "BadJavascript",
      };
    }
    const dataObject = Object.fromEntries(formData);
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const insertImageStatus = await insertImage(imageFile)
          .catch((error) => {
            console.error(error);
          });
      if (insertImageStatus["code"] !== undefined) {
        return insertImageStatus;
      }
      const insertPostStatus = await insertPost(
          threadId,
          postText,
          insertImageStatus,
      )
          .catch((error) => {
            console.error(error);
          });
      if (insertPostStatus["code"] === undefined) {
        await this.#thread.rebuildThreadFromThreadId();
        this.reloadList(); // Do not await.
      }
      return insertPostStatus;
    }
    const insertPostStatus = await insertPost(threadId, postText, null)
        .catch((error) => {
          console.error(error);
        });
    if (insertPostStatus["code"] === undefined) {
      await this.#thread.rebuildThreadFromThreadId();
      this.reloadList(); // Do not await.
    }
    return insertPostStatus;
  }

  async modifyPost(formData, post) {
    const postId = post.getPostId();
    if (typeof postId !== "number") {
      return {
        code: 1336,
        description: "We have lost the post_id, please reload and try again.",
        name: "BadJavascript",
      };
    }
    const dataObject = Object.fromEntries(formData);
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const insertImageStatus = await insertImage(imageFile)
          .catch((error) => {
            console.error(error);
          });
      if (insertImageStatus["code"] !== undefined) {
        return insertImageStatus;
      }
      const updatePostStatus = await updatePost(
          postId,
          postText,
          insertImageStatus,
      )
          .catch((error) => {
            console.error(error);
          });
      if (
          updatePostStatus["code"] === undefined &&
          updatePostStatus === postId
      ) {
        if (postId === this.#thread.getPostId()) {
          await this.#thread.rebuildThreadFromThreadId();
        }
        this.reloadList(); // Do not await.
      }
      return updatePostStatus;
    }
    const updatePostStatus = await updatePost(
        postId,
        postText,
        null,
    )
        .catch((error) => {
          console.error(error);
        });
    if (
        updatePostStatus["code"] === undefined &&
        updatePostStatus === postId
    ) {
      if (postId === this.#thread.getPostId()) {
        await this.#thread.rebuildThreadFromThreadId();
      }
      this.reloadList(); // Do not await.
    }
    return updatePostStatus;
  }

  async deletePost(post) {
    const postId = post.getPostId();
    if (typeof postId !== "number") {
      return {
        code: 1336,
        description: "We have lost the post_id, please reload and try again.",
        name: "BadJavascript",
      };
    }
    const deletePostStatus = await deletePost(postId)
        .catch((error) => {
          console.error(error);
        });
    if (
        deletePostStatus["code"] === undefined &&
        deletePostStatus === postId
    ) {
      if (postId === this.#thread.getPostId()) {
        await this.#thread.rebuildThreadFromThreadId();
      }
      this.reloadList(); // Do not await.
    }
    return deletePostStatus;
  }

  async reloadList() {
    console.log("reload posts"); // TODO(wathne): Delete this line.
    while (this.#posts.length) {
      this.#posts.pop();
    }
    const threadId = this.#thread.getThreadId();
    if (typeof threadId !== "number") {
      this.#showList();
      return {
        code: 1336,
        description: "We have lost the thread_id, please reload and try again.",
        name: "BadJavascript",
      };
    }
    const retrievePostsStatus = await retrievePosts(threadId)
        .catch((error) => {
          console.error(error);
        });
    if (retrievePostsStatus["code"] !== undefined) {
      this.#showList();
      return retrievePostsStatus;
    }
    // TODO(wathne): Show incomplete posts for a more responsive experience.
    // TODO(wathne): Do not wait for slow promises.
    // TODO(wathne): Timer and Promise.race()?
    const promises = retrievePostsStatus
        .map(async (post) => {
          return Post.createPostFromPostObject(post);
        });
    const settlements = await Promise.allSettled(promises)
        .catch((error) => {
          console.error(error);
        });
    const topPostId = this.#thread.getPostId();
    for (const settlement of settlements) {
      if (settlement["status"] === "fulfilled") {
        const post = settlement["value"];
        if (post.getPostId() !== topPostId) {
          this.#posts.push(post);
        }
        console.log(post.toHumanReadable());
      }
      if (settlement["status"] === "rejected") {
        console.log(settlement["reason"]);
      }
    }
    for (const post of this.#posts) {
      this.#createModifyPostBox(post);
      this.#createDeletePostBox(post);
    }
    this.sortList();
    return {};
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


class SessionManager {
  #triggerFunction;
  // *Handler
  #registerHandler;
  #loginHandler;
  #logoutHandler;

  constructor(extraElement, buttonsElement, triggerFunction) {
    this.#triggerFunction = triggerFunction;
    // *Handler
    this.#registerHandler = new RegisterHandler(this.register.bind(this));
    this.#loginHandler = new LoginHandler(this.login.bind(this));
    this.#logoutHandler = new LogoutHandler(this.logout.bind(this));
    // register*
    const registerBox = this.#registerHandler.createBox();
    const registerMainElement = registerBox.getMainElement();
    const registerButton = registerBox.createButton();
    // login*
    const loginBox = this.#loginHandler.createBox();
    const loginMainElement = loginBox.getMainElement();
    const loginButton = loginBox.createButton();
    // logout*
    const logoutBox = this.#logoutHandler.createBox();
    const logoutMainElement = logoutBox.getMainElement();
    const logoutButton = logoutBox.createButton();
    // Append elements.
    extraElement.appendChild(registerMainElement);
    extraElement.appendChild(loginMainElement);
    extraElement.appendChild(logoutMainElement);
    buttonsElement.appendChild(registerButton);
    buttonsElement.appendChild(loginButton);
    buttonsElement.appendChild(logoutButton);
  }

  async register(formData) {
    const dataObject = Object.fromEntries(formData);
    const username = dataObject["username"];
    const password = dataObject["password"];
    if (typeof username !== "string") {
      return {
        code: 1336,
        description: "We have lost the username, please reload and try again.",
        name: "BadJavascript",
      };
    }
    if (typeof password !== "string") {
      return {
        code: 1336,
        description: "We have lost the password, please reload and try again.",
        name: "BadJavascript",
      };
    }
    const sessionRegisterStatus = await sessionRegister(username, password)
        .catch((error) => {
          console.error(error);
        });
    if (sessionRegisterStatus["code"] === undefined) {
      this.#triggerFunction();
    }
    return sessionRegisterStatus;
  }

  async login(formData) {
    const dataObject = Object.fromEntries(formData);
    const username = dataObject["username"];
    const password = dataObject["password"];
    if (typeof username !== "string") {
      return {
        code: 1336,
        description: "We have lost the username, please reload and try again.",
        name: "BadJavascript",
      };
    }
    if (typeof password !== "string") {
      return {
        code: 1336,
        description: "We have lost the password, please reload and try again.",
        name: "BadJavascript",
      };
    }
    const sessionLoginStatus = await sessionLogin(username, password)
        .catch((error) => {
          console.error(error);
        });
    if (sessionLoginStatus["code"] === undefined) {
      this.#triggerFunction();
    }
    return sessionLoginStatus;
  }

  async logout() {
    const sessionLogoutStatus = await sessionLogout()
        .catch((error) => {
          console.error(error);
        });
    if (sessionLogoutStatus["code"] === undefined) {
      this.#triggerFunction();
    }
    return sessionLogoutStatus;
  }
}


class Imageboard {
  #threadsManager;
  #showThreadsTriggerFunction;
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
    this.#showThreadsTriggerFunction =
        this.#threadsManager.getShowThreadsTriggerFunction();
    this.#sessionManager = new SessionManager(
        extraElement,
        buttonsElement,
        this.#showThreadsTriggerFunction,
    );
  }

  async loadSettings() {
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

  showThreads() {
    this.#showThreadsTriggerFunction();
  }
}

const imageboard = new Imageboard(
    divMainContentElement,
    divMainExtraElement,
    divHeaderButtonsElement,
);
imageboard.loadSettings();
imageboard.showThreads();

