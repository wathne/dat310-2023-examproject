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
 *   filterSearchElement
 *   filterSortOrderElement
 *   filterCriteriaElement
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
 *   RegisterHandler
 *   LoginHandler
 *   LogoutHandler
 *   FilterHandler
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
 * TODO(wathne): Refactor FilterHandler.
 * TODO(wathne): Delete a few console.log() lines.
 */

"use strict";


// Elements by id.
// @FilterHandler.
const filterSearchElement = document.getElementById("filter-search");
// @FilterHandler.
const filterSortOrderElement = document.getElementById("filter-sort-order");
// @FilterHandler.
const filterCriteriaElement = document.getElementById("filter-criteria");


// A ShowThreadsHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
class ShowThreadsHandler {
  #showThreadsFunction;

  constructor(showThreadsFunction) {
    this.#showThreadsFunction = showThreadsFunction;
  }

  createBox() {
    return new ShowThreadsBox(this);
  }

  handleButtonStartClickEvent(box) {
    box.clearError();
    box.showMainElement();
    this.#showThreadsFunction()
        .then((status) => {
          if (status["code"] === undefined) {
            // Do nothing.
          } else {
            box.setError(
                `${status["code"]} ${status["name"]}: ` +
                `${status["description"]}`
            );
          }
        })
        .catch((error) => {
          box.setError(error);
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
  #addThreadFunction;

  constructor(addThreadFunction) {
    this.#addThreadFunction = addThreadFunction;
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
      this.#addThreadFunction(formData)
          .then((status) => {
            if (status["code"] === undefined) {
              box.hideMainElement();
            } else {
              box.setError(
                  `${status["code"]} ${status["name"]}: ` +
                  `${status["description"]}`
              );
            }
          })
          .catch((error) => {
            box.setError(error);
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
  #modifyThreadFunction;

  constructor(modifyThreadFunction) {
    this.#modifyThreadFunction = modifyThreadFunction;
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
      this.#modifyThreadFunction(formData, box.getTarget())
          .then((status) => {
            if (status["code"] === undefined) {
              box.hideMainElement();
            } else {
              box.setError(
                  `${status["code"]} ${status["name"]}: ` +
                  `${status["description"]}`
              );
            }
          })
          .catch((error) => {
            box.setError(error);
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
  #deleteThreadFunction;

  constructor(deleteThreadFunction) {
    this.#deleteThreadFunction = deleteThreadFunction;
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
    this.#deleteThreadFunction(box.getTarget())
        .then((status) => {
          if (status["code"] === undefined) {
            box.hideMainElement();
          } else {
            box.setError(
                `${status["code"]} ${status["name"]}: ` +
                `${status["description"]}`
            );
          }
        })
        .catch((error) => {
          box.setError(error);
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
  #showPostsFunction;

  constructor(showPostsFunction) {
    this.#showPostsFunction = showPostsFunction;
  }

  createBox() {
    return new ShowPostsBox(this);
  }

  handleButtonStartClickEvent(box) {
    box.clearError();
    box.showMainElement();
    this.#showPostsFunction()
        .then((status) => {
          if (status["code"] === undefined) {
            // Do nothing.
          } else {
            box.setError(
                `${status["code"]} ${status["name"]}: ` +
                `${status["description"]}`
            );
          }
        })
        .catch((error) => {
          box.setError(error);
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
  #addPostFunction;

  constructor(addPostFunction) {
    this.#addPostFunction = addPostFunction;
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
      this.#addPostFunction(formData)
          .then((status) => {
            if (status["code"] === undefined) {
              box.hideMainElement();
            } else {
              box.setError(
                  `${status["code"]} ${status["name"]}: ` +
                  `${status["description"]}`
              );
            }
          })
          .catch((error) => {
            box.setError(error);
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
  #modifyPostFunction;

  constructor(modifyPostFunction) {
    this.#modifyPostFunction = modifyPostFunction;
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
      this.#modifyPostFunction(formData, box.getTarget())
          .then((status) => {
            if (status["code"] === undefined) {
              box.hideMainElement();
            } else {
              box.setError(
                  `${status["code"]} ${status["name"]}: ` +
                  `${status["description"]}`
              );
            }
          })
          .catch((error) => {
            box.setError(error);
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
  #deletePostFunction;

  constructor(deletePostFunction) {
    this.#deletePostFunction = deletePostFunction;
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
    this.#deletePostFunction(box.getTarget())
        .then((status) => {
          if (status["code"] === undefined) {
            box.hideMainElement();
          } else {
            box.setError(
                `${status["code"]} ${status["name"]}: ` +
                `${status["description"]}`
            );
          }
        })
        .catch((error) => {
          box.setError(error);
          console.error(error);
        })
        .finally(() => {
        });
  }
}


// A RegisterHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
class RegisterHandler {
  #registerFunction;

  constructor(registerFunction) {
    this.#registerFunction = registerFunction;
  }

  createBox() {
    return new RegisterBox(this);
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
    const userValidationErrors = userValidation(formData);
    if (userValidationErrors === null) {
      this.#registerFunction(formData)
          .then((status) => {
            if (status["code"] === undefined) {
              box.hideMainElement();
            } else {
              box.setError(
                  `${status["code"]} ${status["name"]}: ` +
                  `${status["description"]}`
              );
            }
          })
          .catch((error) => {
            box.setError(error);
            console.error(error);
          })
          .finally(() => {
          });
    } else {
      box.setError(userValidationErrors.join("\n"));
    }
  }
}


// A LoginHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
class LoginHandler {
  #loginFunction;

  constructor(loginFunction) {
    this.#loginFunction = loginFunction;
  }

  createBox() {
    return new LoginBox(this);
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
    const userValidationErrors = userValidation(formData);
    if (userValidationErrors === null) {
      this.#loginFunction(formData)
          .then((status) => {
            if (status["code"] === undefined) {
              box.hideMainElement();
            } else {
              box.setError(
                  `${status["code"]} ${status["name"]}: ` +
                  `${status["description"]}`
              );
            }
          })
          .catch((error) => {
            box.setError(error);
            console.error(error);
          })
          .finally(() => {
          });
    } else {
      box.setError(userValidationErrors.join("\n"));
    }
  }
}


// A LogoutHandler must implement the following functions:
//   - handleButtonStartClickEvent(box)
//   - handleButtonCancelClickEvent(box)
//   - handleFormSubmitEvent(box)
class LogoutHandler {
  #logoutFunction;

  constructor(logoutFunction) {
    this.#logoutFunction = logoutFunction;
  }

  createBox() {
    return new LogoutBox(this);
  }

  handleButtonStartClickEvent(box) {
    box.showMainElement();
  }

  handleButtonCancelClickEvent(box) {
    box.hideMainElement();
  }

  handleFormSubmitEvent(box) {
    box.clearError();
    this.#logoutFunction()
        .then((status) => {
          if (status["code"] === undefined) {
            box.hideMainElement();
          } else {
            box.setError(
                `${status["code"]} ${status["name"]}: ` +
                `${status["description"]}`
            );
          }
        })
        .catch((error) => {
          box.setError(error);
          console.error(error);
        })
        .finally(() => {
        });
  }
}


// TODO(wathne): Refactor.
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

