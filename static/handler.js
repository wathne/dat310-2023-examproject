/* Handler classes.
 * 
 * 
 * Load order:
 * -----------
 *   /static/api.js
 *   /static/form-validation.js
 *   /static/box.js
 *   /static/handler.js <- YOU ARE HERE
 *   /static/imageboard.js
 * 
 * 
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
 *   <script src="/static/handler.js" type="text/javascript"></script>
 *   <!-- Other JavaScript file. -->
 *   <script src="/static/script.js" type="text/javascript"></script>
 * </body>
 * </html>
 * 
 * 
 * TODO(wathne): The constructors should take a function instead of a *Manager.
 * TODO(wathne): Catch any 4** and 500 error messages.
 * TODO(wathne): Refactor FilterHandler, implement latest Handler interface.
 * TODO(wathne): Refactor RegisterHandler, implement latest Handler interface.
 * TODO(wathne): Refactor LoginHandler, implement latest Handler interface.
 * TODO(wathne): Refactor LogoutHandler, implement latest Handler interface.
 * TODO(wathne): Delete a few console.log() lines.
 */

"use strict";


// Elements by class.
// @RegisterHandler, @LoginHandler, @LogoutHandler.
const buttonCancelElements = document.getElementsByClassName("button-cancel");
// @RegisterHandler.
const buttonRegisterElements = document.getElementsByClassName("button-register");
// @LoginHandler.
const buttonLoginElements = document.getElementsByClassName("button-login");
// @LogoutHandler.
const buttonLogoutElements = document.getElementsByClassName("button-logout");


// Elements by id.
// @FilterHandler.
const filterSearchElement = document.getElementById("filter-search");
// @FilterHandler.
const filterSortOrderElement = document.getElementById("filter-sort-order");
// @FilterHandler.
const filterCriteriaElement = document.getElementById("filter-criteria");
// @RegisterHandler.
const divRegisterElement = document.getElementById("register");
// @LoginHandler.
const divLoginElement = document.getElementById("login");
// @LogoutHandler.
const divLogoutElement = document.getElementById("logout");
// @RegisterHandler.
const formRegisterElement = document.getElementById("form-register");
// @LoginHandler.
const formLoginElement = document.getElementById("form-login");
// @LogoutHandler.
const formLogoutElement = document.getElementById("form-logout");


// A ShowThreadsHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
class ShowThreadsHandler {
  #threadsManager;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(threadsManager) {
    // A ThreadsManager is necessary for this.#threadsManager.reloadList().
    this.#threadsManager = threadsManager;
  }

  createBox() {
    return new ShowThreadsBox(this);
  }

  handleButtonStartClickEvent(box) {
    box.clearError();
    box.showMainElement();
    this.#threadsManager.reloadList()
        .then((success) => {
          if (success) {
            // Do nothing.
          } else {
            // TODO(wathne): Catch any 4** and 500 error messages.
            box.setError("Error: Failed to load threads.");
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
        });
  }

  handleButtonCancelClickEvent(box) {
    box.hideMainElement();
  }
}


// An AddThreadHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
//   - handleFormImageChangeEvent(box)
class AddThreadHandler {
  #threadsManager;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(threadsManager) {
    // A ThreadsManager is necessary for this.#threadsManager.addThread().
    this.#threadsManager = threadsManager;
  }

  createBox() {
    return new AddThreadBox(this);
  }

  handleButtonStartClickEvent(box) {
    box.showMainElement();
  }

  handleButtonCancelClickEvent(box) {
    box.hideMainElement();
  }

  handleFormSubmitEvent(box) {
    box.clearError();
    const formData = box.getFormData();
    const threadValidationErrors = threadValidation(formData);
    if (threadValidationErrors === null) {
      this.#threadsManager.addThread(formData)
          .then((success) => {
            if (success) {
              box.hideMainElement();
            } else {
              // TODO(wathne): Catch any 4** and 500 error messages.
              box.setError("Error: Failed to add thread.");
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
          });
    } else {
      box.setError(threadValidationErrors.join("\n"));
    }
  }

  handleFormImageChangeEvent(box) {
    box.updateImagePreview();
  }
}


// A ModifyThreadHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
//   - handleFormImageChangeEvent(box)
class ModifyThreadHandler {
  #threadsManager;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(threadsManager) {
    // A ThreadsManager is necessary for this.#threadsManager.modifyThread().
    this.#threadsManager = threadsManager;
  }

  createBox(target) {
    return new ModifyThreadBox(this, target);
  }

  handleButtonStartClickEvent(box) {
    box.showMainElement();
  }

  handleButtonCancelClickEvent(box) {
    box.hideMainElement();
  }

  handleFormSubmitEvent(box) {
    box.clearError();
    const formData = box.getFormData();
    const threadValidationErrors = threadValidation(formData);
    if (threadValidationErrors === null) {
      this.#threadsManager.modifyThread(formData, box.getTarget())
          .then((success) => {
            if (success) {
              box.hideMainElement();
            } else {
              // TODO(wathne): Catch any 4** and 500 error messages.
              box.setError("Error: Failed to modify thread.");
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
          });
    } else {
      box.setError(threadValidationErrors.join("\n"));
    }
  }

  handleFormImageChangeEvent(box) {
    box.updateImagePreview();
  }
}


// A DeleteThreadHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
class DeleteThreadHandler {
  #threadsManager;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(threadsManager) {
    // A ThreadsManager is necessary for this.#threadsManager.deleteThread().
    this.#threadsManager = threadsManager;
  }

  createBox(target) {
    return new DeleteThreadBox(this, target);
  }

  handleButtonStartClickEvent(box) {
    box.showMainElement();
  }

  handleButtonCancelClickEvent(box) {
    box.hideMainElement();
  }

  handleFormSubmitEvent(box) {
    box.clearError();
    this.#threadsManager.deleteThread(box.getTarget())
        .then((success) => {
          if (success) {
            box.hideMainElement();
          } else {
            // TODO(wathne): Catch any 4** and 500 error messages.
            box.setError("Error: Failed to delete thread.");
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
        });
  }
}


// A ShowPostsHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
class ShowPostsHandler {
  #postsManager;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(postsManager) {
    // A PostsManager is necessary for this.#postsManager.reloadList().
    this.#postsManager = postsManager;
  }

  createBox() {
    return new ShowPostsBox(this);
  }

  handleButtonStartClickEvent(box) {
    box.clearError();
    box.showMainElement();
    this.#postsManager.reloadList()
        .then((success) => {
          if (success) {
            // Do nothing.
          } else {
            // TODO(wathne): Catch any 4** and 500 error messages.
            box.setError("Error: Failed to load posts.");
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
        });
  }

  handleButtonCancelClickEvent(box) {
    box.hideMainElement();
  }
}


// An AddPostHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
//   - handleFormImageChangeEvent(box)
class AddPostHandler {
  #postsManager;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(postsManager) {
    // A PostsManager is necessary for this.#postsManager.addPost().
    this.#postsManager = postsManager;
  }

  createBox() {
    return new AddPostBox(this);
  }

  handleButtonStartClickEvent(box) {
    box.showMainElement();
  }

  handleButtonCancelClickEvent(box) {
    box.hideMainElement();
  }

  handleFormSubmitEvent(box) {
    box.clearError();
    const formData = box.getFormData();
    const postValidationErrors = postValidation(formData);
    if (postValidationErrors === null) {
      this.#postsManager.addPost(formData)
          .then((success) => {
            if (success) {
              box.hideMainElement();
            } else {
              // TODO(wathne): Catch any 4** and 500 error messages.
              box.setError("Error: Failed to add post.");
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
          });
    } else {
      box.setError(postValidationErrors.join("\n"));
    }
  }

  handleFormImageChangeEvent(box) {
    box.updateImagePreview();
  }
}


// A ModifyPostHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
//   - handleFormImageChangeEvent(box)
class ModifyPostHandler {
  #postsManager;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(postsManager) {
    // A PostsManager is necessary for this.#postsManager.modifyPost().
    this.#postsManager = postsManager;
  }

  createBox(target) {
    return new ModifyPostBox(this, target);
  }

  handleButtonStartClickEvent(box) {
    box.showMainElement();
  }

  handleButtonCancelClickEvent(box) {
    box.hideMainElement();
  }

  handleFormSubmitEvent(box) {
    box.clearError();
    const formData = box.getFormData();
    const postValidationErrors = postValidation(formData);
    if (postValidationErrors === null) {
      this.#postsManager.modifyPost(formData, box.getTarget())
          .then((success) => {
            if (success) {
              box.hideMainElement();
            } else {
              // TODO(wathne): Catch any 4** and 500 error messages.
              box.setError("Error: Failed to modify post.");
            }
          })
          .catch((error) => {
            console.error(error);
          })
          .finally(() => {
          });
    } else {
      box.setError(postValidationErrors.join("\n"));
    }
  }

  handleFormImageChangeEvent(box) {
    box.updateImagePreview();
  }
}


// A DeletePostHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
class DeletePostHandler {
  #postsManager;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(postsManager) {
    // A PostsManager is necessary for this.#postsManager.deletePost().
    this.#postsManager = postsManager;
  }

  createBox(target) {
    return new DeletePostBox(this, target);
  }

  handleButtonStartClickEvent(box) {
    box.showMainElement();
  }

  handleButtonCancelClickEvent(box) {
    box.hideMainElement();
  }

  handleFormSubmitEvent(box) {
    box.clearError();
    this.#postsManager.deletePost(box.getTarget())
        .then((success) => {
          if (success) {
            box.hideMainElement();
          } else {
            // TODO(wathne): Catch any 4** and 500 error messages.
            box.setError("Error: Failed to delete post.");
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
        });
  }
}


// TODO(wathne): Refactor and implement the latest Handler interface.
class FilterHandler {
  #manager; // #manager is a ThreadsManager or PostsManager.
  #search; // #search is a string and defaults to "".
  #sortOrder; // #sortOrder is a boolean and defaults to true.
  #criteria; // "last-modified", "subject", "text", "image" or "timestamp".

  // TODO(wathne): The constructor should take functions instead of a *Manager.
  constructor(manager) {
    // A *Manager is necessary for this.#manager.filterList().
    // A *Manager is necessary for this.#manager.sortList().
    // See implementation of handleEvent(event).
    this.#manager = manager;
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

  #setSettings() {
    const settings = {
      "filter-criteria": this.#criteria,
      "filter-sort-order": this.#sortOrder,
    };
    setSettings(settings)
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
        });
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
        this.#manager.filterList();
      }
    }
    if (event.target === filterSortOrderElement) {
      if (event.type === "input") {
        this.#sortOrder = event.target.checked;
        this.#setSettings();
        this.#manager.sortList();
      }
    }
    if (event.target === filterCriteriaElement) {
      if (event.type === "input") {
        this.#criteria = event.target.value;
        this.#setSettings();
        this.#manager.sortList();
      }
    }
  }
}


// TODO(wathne): Refactor and implement the latest Handler interface.
class RegisterHandler {
  #sessionManager;
  #sessionCredential;
  #mainElement;
  #formElement;
  #buttonStartElements;
  #buttonCancelElements;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(sessionManager) {
    // A SessionManager is necessary for this.#sessionManager.register().
    // See implementation of handleEvent(event).
    this.#sessionManager = sessionManager;
    this.#sessionCredential = new SessionCredential();
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

  handleEvent(event) {
    if (event.target === this.#formElement) {
      if (event.type === "submit") {
        const formData = new FormData(this.#formElement);
        const userValidationErrors = userValidation(formData);
        if (userValidationErrors === null) {
          const dataObject = Object.fromEntries(formData);
          this.#sessionCredential.username = dataObject["username"];
          this.#sessionCredential.password = dataObject["password"];
          // TODO(wathne): Delete the next line.
          console.log(this.#sessionCredential.toHumanReadable());
          this.#sessionManager.register(this.#sessionCredential)
              .then((success) => {
                if (success) {
                  this.#mainElement.style.display = "none";
                } else {
                  // TODO(wathne): Message about registration failure.
                  // TODO(wathne): Delete the next line.
                  console.log("TODO: Message about registration failure.");
                }
              })
              .catch((error) => {
                console.error(error);
              })
              .finally(() => {
              });
        } else {
          for (const error of userValidationErrors) {
            // TODO(wathne): Message about invalid formData.
            console.log(error); // TODO(wathne): Delete this line.
          }
        }
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


// TODO(wathne): Refactor and implement the latest Handler interface.
class LoginHandler {
  #sessionManager;
  #sessionCredential;
  #mainElement;
  #formElement;
  #buttonStartElements;
  #buttonCancelElements;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(sessionManager) {
    // A SessionManager is necessary for this.#sessionManager.login().
    // See implementation of handleEvent(event).
    this.#sessionManager = sessionManager;
    this.#sessionCredential = new SessionCredential();
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

  handleEvent(event) {
    if (event.target === this.#formElement) {
      if (event.type === "submit") {
        const formData = new FormData(this.#formElement);
        const dataObject = Object.fromEntries(formData);
        this.#sessionCredential.username = dataObject["username"];
        this.#sessionCredential.password = dataObject["password"];
        // TODO(wathne): Delete the next line.
        console.log(this.#sessionCredential.toHumanReadable());
        this.#sessionManager.login(this.#sessionCredential)
            .then((success) => {
              if (success) {
                this.#mainElement.style.display = "none";
              } else {
                // TODO(wathne): Message about login failure.
                // TODO(wathne): Delete the next line.
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


// TODO(wathne): Refactor and implement the latest Handler interface.
class LogoutHandler {
  #sessionManager;
  #mainElement;
  #formElement;
  #buttonStartElements;
  #buttonCancelElements;

  // TODO(wathne): The constructor should take a function instead of a *Manager.
  constructor(sessionManager) {
    // A SessionManager is necessary for this.#sessionManager.logout().
    // See implementation of handleEvent(event).
    this.#sessionManager = sessionManager;
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
        this.#sessionManager.logout()
            .then((success) => {
              if (success) {
                this.#mainElement.style.display = "none";
              } else {
                // TODO(wathne): Message about logout failure.
                // TODO(wathne): Delete the next line.
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

