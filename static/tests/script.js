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


function threadValidation(formData) {
  const dataObject = Object.fromEntries(formData);
  const threadSubject = dataObject["subject"];

  if (threadSubject === "") {
    return false;
  }

  return true;
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


// TODO(wathne): Refactor rebuild() and async stuff.
class Thread {
  constructor(
      postId,
      threadId,
      threadLastModified,
      threadSubject,
      threadTimestamp,
      userId,
  ) {
    this.hidden = true;

    this.postId = postId;
    this.threadId = threadId;
    this.threadTimestamp = threadTimestamp;
    this.userId = userId;

    this.div = document.createElement("div");
    this.div.className = "thread";

    this.subjectElement = document.createElement("div");
    this.subjectElement.className = "thread-subject";

    this.thumbnailContainerElement = document.createElement("div");
    this.thumbnailContainerElement.className = "thumbnail-container";
    this.thumbnailElement = document.createElement("img");
    this.thumbnailElement.className = "thumbnail";
    this.thumbnailElement.alt = "";
    this.thumbnailElement.src = pixelPNG;
    this.thumbnailContainerElement.appendChild(this.thumbnailElement);

    this.textElement = document.createElement("div");
    this.textElement.className = "thread-text";

    // TODO(wathne): Delete testElement.
    this.testElement = document.createElement("div");

    this.rebuild(
      threadLastModified,
      threadSubject,
    );
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    return `[Thread] ` +
           `postId: "${this.postId}", ` +
           `threadId: "${this.threadId}", ` +
           `threadLastModified: "${this.threadLastModified}", ` +
           `threadSubject: "${this.threadSubject}", ` +
           `threadTimestamp: "${this.threadTimestamp}", ` +
           `userId: "${this.userId}"`;
  }

  rebuild(
      threadLastModified,
      threadSubject,
  ) {
    this.imageId = null;
    this.postText = null;
    this.threadLastModified = threadLastModified;
    this.threadSubject = threadSubject;

    this.subjectElement.textContent = this.threadSubject;

    retrievePost(this.postId)
      .then((post) => {
        this.imageId = post["image_id"];
        this.postText = post["post_text"];
        this.textElement.textContent = this.postText;
        if (this.imageId === null) {
          return null;
        }
        return retrieveImage(this.imageId);
      })
      .then((imageBlob) => {
        if (imageBlob === null) {
          return null;
        }
        const previousURL = this.thumbnailElement.src;
        this.thumbnailElement.src = pixelPNG; // Placeholder URL.
        URL.revokeObjectURL(previousURL); // Release previous URL.
        this.thumbnailElement.src = URL.createObjectURL(imageBlob); // New URL.
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        // TODO(wathne): Delete testElement.
        this.testElement.textContent = this.toHumanReadable();

        while (this.div.firstChild) {
          this.div.removeChild(this.div.firstChild);
        }
        this.div.appendChild(this.subjectElement);
        if (true) {
          this.div.appendChild(this.thumbnailContainerElement);
        }
        if (true) {
          this.div.appendChild(this.textElement);
        }
        // TODO(wathne): Delete testElement.
        this.div.appendChild(this.testElement);
      });
  }

  isVisible() {
    return !this.hidden;
  }

  filterCompare(filterSearch, filterCriteria) {
    const searchLC = filterSearch.toLowerCase();
    const subjectLC = this.threadSubject.toLowerCase();

    if (filterSearch === "") {
      this.hidden = false;
      return;
    }
    switch (filterCriteria) {
      case "last-modified":
        this.hidden = false;
        return;
      case "subject":
        if (subjectLC.includes(searchLC)) {
          this.hidden = false;
          return;
        }
        this.hidden = true;
        return;
      case "timestamp":
        this.hidden = false;
        return;
    }
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
        if (threadValidation(formData)) {
          this.parent.addThread(formData);
          this.div.style.display = "none";
        } else {
          // TODO: Message about invalid formData.
          console.log("TODO: Message about invalid formData.");
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
  constructor() {
    this.filterHandler = new FilterHandler(this);
    this.addThreadHandler = new AddThreadHandler(this);
    this.registerHandler = new RegisterHandler(this);
    this.loginHandler = new LoginHandler(this);
    this.logoutHandler = new LogoutHandler(this);

    this.div = divMainContentElement;

    this.threads = [];
  }

  // Example: console.log(this.toHumanReadable());
  toHumanReadable() {
    const humanReadableThreads = [];
    for (const thread of this.threads) {
      humanReadableThreads.push(thread.toHumanReadable());
    }
    return humanReadableThreads.join("\n");
  }

  async register() {
    const username = this.registerHandler.loginCredential.username;
    const password = this.registerHandler.loginCredential.password;
    const userId = await sessionRegister(username, password);
    console.log(`register userId: ${userId}`); // TODO: Delete.
    this.reloadThreads();
    if (userId !== null) {
      return true;
    }
    return false;
  }

  async login() {
    const username = this.loginHandler.loginCredential.username;
    const password = this.loginHandler.loginCredential.password;
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

  reloadThreads() {
    console.log("reload threads"); // TODO: Delete.
    while (this.threads.length) {
      this.threads.pop();
    }
    retrieveThreads().then((threads) => {
      if (threads !== null) {
        for (const thread of threads) {
          // TODO(wathne): Multiple thread rebuilds in parallell.
          const postId = thread["post_id"];
          const threadId = thread["thread_id"];
          const threadLastModified = thread["thread_last_modified"];
          const threadSubject = thread["thread_subject"];
          const threadTimestamp = thread["thread_timestamp"];
          const userId = thread["user_id"];
          const newThread = new Thread(
            postId,
            threadId,
            threadLastModified,
            threadSubject,
            threadTimestamp,
            userId,
          );
          console.log(newThread.toHumanReadable()); // TODO: Delete.
          this.threads.push(newThread);
        }
      }
      this.sortThreads();
    });
  }

  addThread(formData) {
    const dataObject = Object.fromEntries(formData);
    const threadSubject = dataObject["subject"];
    const postText = dataObject["text"];
    const imageFile = dataObject["image"];
    insertImage(imageFile)
      .then((imageId) => {
        if (imageId === null) {
          return null;
        }
        return insertThread(threadSubject, postText, imageId);
      })
      .then((threadId) => {
        if (threadId === null) {
          return null;
        }
        this.reloadThreads();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  filterThreads() {
    console.log("filter threads"); // TODO: Delete.
    const filterSearch = this.filterHandler.getSearch();
    const filterCriteria = this.filterHandler.getCriteria();

    for (const thread of this.threads) {
      thread.filterCompare(filterSearch, filterCriteria);
    }
    this.showThreads();
  }

  sortThreads() {
    console.log("sort threads"); // TODO: Delete.
    const filterSortOrder = this.filterHandler.getSortOrder();
    const filterCriteria = this.filterHandler.getCriteria();

    function compareThreadLastModified(a, b) {
      return a.threadTimestamp - b.threadTimestamp;
    }

    function compareThreadSubject(a, b) {
      return a.threadSubject.localeCompare(b.threadSubject);
    }

    function compareThreadTimestamp(a, b) {
      return a.threadTimestamp - b.threadTimestamp;
    }

    switch (filterCriteria) {
      case "last-modified":
        this.threads.sort(compareThreadLastModified);
        break;
      case "subject":
        this.threads.sort(compareThreadSubject);
        break;
      case "timestamp":
        this.threads.sort(compareThreadTimestamp);
        break;
    }
    if (filterSortOrder === false) {
      this.threads.reverse();
    }

    this.filterThreads();
  }

  showThreads() {
    console.log("show threads"); // TODO: Delete.
    while (this.div.firstChild) {
      this.div.removeChild(this.div.firstChild);
    }
    for (const thread of this.threads) {
      if (thread.isVisible()) {
        this.div.appendChild(thread.div);
      }
    }
  }
}

const imageboard = new Imageboard();
imageboard.reloadThreads();

