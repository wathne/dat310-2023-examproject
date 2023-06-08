/* Box classes and pixelPNG constant.
 * 
 * 
 * Load order:
 * -----------
 *   /static/api.js
 *   /static/form-validation.js
 *   /static/box.js <- YOU ARE HERE
 *   /static/handler.js
 *   /static/imageboard.js
 * 
 * 
 * Constant overview:
 * ------------------
 *   pixelPNG
 * 
 * 
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
 *   <script src="/static/box.js" type="text/javascript"></script>
 *   <!-- Other JavaScript file. -->
 *   <script src="/static/script.js" type="text/javascript"></script>
 * </body>
 * </html>
 * 
 * 
 * TODO(wathne): Privatize element instance fields.
 * TODO(wathne): Delete a few console.log() lines.
 */

"use strict";


// Placeholder URL.
const pixelPNG =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0" +
    "lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";


class ShowThreadsBox {
  #showThreadsHandler;

  /* CSS overview:
   * -------------
   *   box-main-show-threads
   *   box-error-container-show-threads
   *   box-error-show-threads
   *   box-button-cancel-show-threads
   *   box-list-show-threads
   *   box-button-start-show-threads
   */
  constructor(showThreadsHandler) {
    // A ShowThreadsHandler is necessary for the event handling of this Box.
    // A ShowThreadsHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    this.#showThreadsHandler = showThreadsHandler;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-show-threads default-hidden framed";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-show-threads";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-show-threads";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-show-threads";
    this.buttonCancel.textContent = "Hide threads";
    // list
    this.list = document.createElement("div");
    this.list.className = "box-list-show-threads";
    // Element structure.
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    this.main.appendChild(this.list);
    // Subscribe this.#showThreadsHandler to events.
    this.buttonCancel.addEventListener(
        "click",
        this.#showThreadsHandler.handleButtonCancelClickEvent
            .bind(this.#showThreadsHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-show-threads";
    button.textContent = "Show threads";
    button.addEventListener(
        "click",
        this.#showThreadsHandler.handleButtonStartClickEvent
            .bind(this.#showThreadsHandler, this),
    );
    return button;
  }

  getListElement() {
    return this.list;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class AddThreadBox {
  #addThreadHandler;

  /* CSS overview:
   * -------------
   *   box-main-add-thread
   *   box-heading-add-thread
   *   box-form-container-add-thread
   *   box-form-add-thread
   *   box-form-subject-add-thread
   *   box-form-text-add-thread
   *   box-form-image-add-thread
   *   box-form-submit-add-thread
   *   box-error-container-add-thread
   *   box-error-add-thread
   *   box-button-cancel-add-thread
   *   box-button-start-add-thread
   */
  constructor(addThreadHandler) {
    // An AddThreadHandler is necessary for the event handling of this Box.
    // An AddThreadHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    //   - handleFormSubmitEvent(box)
    //   - handleFormImageChangeEvent(box)
    this.#addThreadHandler = addThreadHandler;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-add-thread default-hidden framed";
    // heading
    this.heading = document.createElement("h3");
    this.heading.className = "box-heading-add-thread";
    this.heading.textContent = "Add thread";
    // flexLeftAligned
    this.flexLeftAligned = document.createElement("div");
    this.flexLeftAligned.className = "flex-left-aligned";
    // thumbnailContainer
    this.thumbnailContainer = document.createElement("div");
    this.thumbnailContainer.className = "flex-centered thumbnail-container";
    // thumbnail
    this.thumbnail = document.createElement("img");
    this.thumbnail.className = "thumbnail";
    this.thumbnail.alt = "";
    this.thumbnail.src = pixelPNG; // Placeholder URL.
    // formContainer
    this.formContainer = document.createElement("div");
    this.formContainer.className = "box-form-container-add-thread";
    // form
    this.form = document.createElement("form");
    this.form.className = "box-form-add-thread";
    this.form.onsubmit = (event) => false;
    // part1, part2, part3, part4
    this.part1 = document.createElement("p");
    this.part2 = document.createElement("p");
    this.part3 = document.createElement("p");
    this.part4 = document.createElement("p");
    // formSubject
    this.formSubject = document.createElement("input");
    this.formSubject.className = "box-form-subject-add-thread";
    this.formSubject.name = "subject";
    this.formSubject.type = "text";
    // formText
    this.formText = document.createElement("textarea");
    this.formText.className = "box-form-text-add-thread";
    this.formText.name = "text";
    this.formText.placeholder = "post text";
    // formImage
    this.formImage = document.createElement("input");
    this.formImage.className = "box-form-image-add-thread";
    this.formImage.name = "image";
    this.formImage.type = "file";
    this.formImage.accept = "image/*";
    // formSubmit
    this.formSubmit = document.createElement("input");
    this.formSubmit.className = "box-form-submit-add-thread";
    this.formSubmit.type = "submit";
    this.formSubmit.value = "Add thread";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-add-thread";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-add-thread";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-add-thread";
    this.buttonCancel.textContent = "Cancel";
    // Element structure.
    this.main.appendChild(this.heading);
    this.main.appendChild(this.flexLeftAligned);
    this.flexLeftAligned.appendChild(this.thumbnailContainer);
    this.thumbnailContainer.appendChild(this.thumbnail);
    this.flexLeftAligned.appendChild(this.formContainer);
    this.formContainer.appendChild(this.form);
    this.form.appendChild(this.part1);
    this.form.appendChild(this.part2);
    this.form.appendChild(this.part3);
    this.form.appendChild(this.part4);
    this.part1.appendChild(this.formSubject);
    this.part2.appendChild(this.formText);
    this.part3.appendChild(this.formImage);
    this.part4.appendChild(this.formSubmit);
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    // Subscribe this.#addThreadHandler to events.
    this.form.addEventListener(
        "submit",
        this.#addThreadHandler.handleFormSubmitEvent
            .bind(this.#addThreadHandler, this),
    );
    this.formImage.addEventListener(
        "change",
        this.#addThreadHandler.handleFormImageChangeEvent
            .bind(this.#addThreadHandler, this),
    );
    this.buttonCancel.addEventListener(
        "click",
        this.#addThreadHandler.handleButtonCancelClickEvent
            .bind(this.#addThreadHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-add-thread";
    button.textContent = "Add thread";
    button.addEventListener(
        "click",
        this.#addThreadHandler.handleButtonStartClickEvent
            .bind(this.#addThreadHandler, this),
    );
    return button;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  getFormData() {
    return new FormData(this.form);
  }

  updateImagePreview() {
    const formData = new FormData(this.form);
    const dataObject = Object.fromEntries(formData);
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const previousURL = this.thumbnail.src;
      if (previousURL !== pixelPNG && previousURL !== "") {
        this.thumbnail.src = pixelPNG; // Placeholder URL.
        URL.revokeObjectURL(previousURL); // Release previous file reference.
        // TODO(wathne): Delete the next line.
        console.log(`Revoked URL: "${previousURL}"`);
      }
      this.thumbnail.src = URL.createObjectURL(imageFile);
    }
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class ModifyThreadBox {
  #modifyThreadHandler;
  #target; // A Thread.

  /* CSS overview:
   * -------------
   *   box-main-modify-thread
   *   box-heading-modify-thread
   *   box-form-container-modify-thread
   *   box-form-modify-thread
   *   box-form-subject-modify-thread
   *   box-form-text-modify-thread
   *   box-form-image-modify-thread
   *   box-form-submit-modify-thread
   *   box-error-container-modify-thread
   *   box-error-modify-thread
   *   box-button-cancel-modify-thread
   *   box-button-start-modify-thread
   */
  constructor(modifyThreadHandler, target) {
    // A ModifyThreadHandler is necessary for the event handling of this Box.
    // A ModifyThreadHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    //   - handleFormSubmitEvent(box)
    //   - handleFormImageChangeEvent(box)
    this.#modifyThreadHandler = modifyThreadHandler;
    this.#target = target;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-modify-thread default-hidden framed";
    // heading
    this.heading = document.createElement("h3");
    this.heading.className = "box-heading-modify-thread";
    this.heading.textContent = "Modify thread";
    // flexLeftAligned
    this.flexLeftAligned = document.createElement("div");
    this.flexLeftAligned.className = "flex-left-aligned";
    // thumbnailContainer
    this.thumbnailContainer = document.createElement("div");
    this.thumbnailContainer.className = "flex-centered thumbnail-container";
    // thumbnail
    this.thumbnail = document.createElement("img");
    this.thumbnail.className = "thumbnail";
    this.thumbnail.alt = "";
    this.thumbnail.src = pixelPNG; // Placeholder URL.
    // formContainer
    this.formContainer = document.createElement("div");
    this.formContainer.className = "box-form-container-modify-thread";
    // form
    this.form = document.createElement("form");
    this.form.className = "box-form-modify-thread";
    this.form.onsubmit = (event) => false;
    // part1, part2, part3, part4
    this.part1 = document.createElement("p");
    this.part2 = document.createElement("p");
    this.part3 = document.createElement("p");
    this.part4 = document.createElement("p");
    // formSubject
    this.formSubject = document.createElement("input");
    this.formSubject.className = "box-form-subject-modify-thread";
    this.formSubject.name = "subject";
    this.formSubject.type = "text";
    // formText
    this.formText = document.createElement("textarea");
    this.formText.className = "box-form-text-modify-thread";
    this.formText.name = "text";
    this.formText.placeholder = "post text";
    // formImage
    this.formImage = document.createElement("input");
    this.formImage.className = "box-form-image-modify-thread";
    this.formImage.name = "image";
    this.formImage.type = "file";
    this.formImage.accept = "image/*";
    // formSubmit
    this.formSubmit = document.createElement("input");
    this.formSubmit.className = "box-form-submit-modify-thread";
    this.formSubmit.type = "submit";
    this.formSubmit.value = "Modify thread";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-modify-thread";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-modify-thread";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-modify-thread";
    this.buttonCancel.textContent = "Cancel";
    // Element structure.
    this.main.appendChild(this.heading);
    this.main.appendChild(this.flexLeftAligned);
    this.flexLeftAligned.appendChild(this.thumbnailContainer);
    this.thumbnailContainer.appendChild(this.thumbnail);
    this.flexLeftAligned.appendChild(this.formContainer);
    this.formContainer.appendChild(this.form);
    this.form.appendChild(this.part1);
    this.form.appendChild(this.part2);
    this.form.appendChild(this.part3);
    this.form.appendChild(this.part4);
    this.part1.appendChild(this.formSubject);
    this.part2.appendChild(this.formText);
    this.part3.appendChild(this.formImage);
    this.part4.appendChild(this.formSubmit);
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    // Subscribe this.#modifyThreadHandler to events.
    this.form.addEventListener(
        "submit",
        this.#modifyThreadHandler.handleFormSubmitEvent
            .bind(this.#modifyThreadHandler, this),
    );
    this.formImage.addEventListener(
        "change",
        this.#modifyThreadHandler.handleFormImageChangeEvent
            .bind(this.#modifyThreadHandler, this),
    );
    this.buttonCancel.addEventListener(
        "click",
        this.#modifyThreadHandler.handleButtonCancelClickEvent
            .bind(this.#modifyThreadHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-modify-thread";
    button.textContent = "Modify thread";
    button.addEventListener(
        "click",
        this.#modifyThreadHandler.handleButtonStartClickEvent
            .bind(this.#modifyThreadHandler, this),
    );
    return button;
  }

  getTarget() {
    return this.#target;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  getFormData() {
    return new FormData(this.form);
  }

  updateImagePreview() {
    const formData = new FormData(this.form);
    const dataObject = Object.fromEntries(formData);
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const previousURL = this.thumbnail.src;
      if (previousURL !== pixelPNG && previousURL !== "") {
        this.thumbnail.src = pixelPNG; // Placeholder URL.
        URL.revokeObjectURL(previousURL); // Release previous file reference.
        // TODO(wathne): Delete the next line.
        console.log(`Revoked URL: "${previousURL}"`);
      }
      this.thumbnail.src = URL.createObjectURL(imageFile);
    }
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class DeleteThreadBox {
  #deleteThreadHandler;
  #target; // A Thread.

  /* CSS overview:
   * -------------
   *   box-main-delete-thread
   *   box-heading-delete-thread
   *   box-form-container-delete-thread
   *   box-form-delete-thread
   *   box-form-submit-delete-thread
   *   box-error-container-delete-thread
   *   box-error-delete-thread
   *   box-button-cancel-delete-thread
   *   box-button-start-delete-thread
   */
  constructor(deleteThreadHandler, target) {
    // A DeleteThreadHandler is necessary for the event handling of this Box.
    // A DeleteThreadHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    //   - handleFormSubmitEvent(box)
    this.#deleteThreadHandler = deleteThreadHandler;
    this.#target = target;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-delete-thread default-hidden framed";
    // heading
    this.heading = document.createElement("h3");
    this.heading.className = "box-heading-delete-thread";
    this.heading.textContent = "Delete thread";
    // flexLeftAligned
    this.flexLeftAligned = document.createElement("div");
    this.flexLeftAligned.className = "flex-left-aligned";
    // formContainer
    this.formContainer = document.createElement("div");
    this.formContainer.className = "box-form-container-delete-thread";
    // form
    this.form = document.createElement("form");
    this.form.className = "box-form-delete-thread";
    this.form.onsubmit = (event) => false;
    // part1
    this.part1 = document.createElement("p");
    // formSubmit
    this.formSubmit = document.createElement("input");
    this.formSubmit.className = "box-form-submit-delete-thread";
    this.formSubmit.type = "submit";
    this.formSubmit.value = "Delete thread";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-delete-thread";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-delete-thread";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-delete-thread";
    this.buttonCancel.textContent = "Cancel";
    // Element structure.
    this.main.appendChild(this.heading);
    this.main.appendChild(this.flexLeftAligned);
    this.flexLeftAligned.appendChild(this.formContainer);
    this.formContainer.appendChild(this.form);
    this.form.appendChild(this.part1);
    this.part1.appendChild(this.formSubmit);
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    // Subscribe this.#deleteThreadHandler to events.
    this.form.addEventListener(
        "submit",
        this.#deleteThreadHandler.handleFormSubmitEvent
            .bind(this.#deleteThreadHandler, this),
    );
    this.buttonCancel.addEventListener(
        "click",
        this.#deleteThreadHandler.handleButtonCancelClickEvent
            .bind(this.#deleteThreadHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-delete-thread";
    button.textContent = "Delete thread";
    button.addEventListener(
        "click",
        this.#deleteThreadHandler.handleButtonStartClickEvent
            .bind(this.#deleteThreadHandler, this),
    );
    return button;
  }

  getTarget() {
    return this.#target;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class ShowPostsBox {
  #showPostsHandler;

  /* CSS overview:
   * -------------
   *   box-main-show-posts
   *   box-error-container-show-posts
   *   box-error-show-posts
   *   box-button-cancel-show-posts
   *   box-list-show-posts
   *   box-button-start-show-posts
   */
  constructor(showPostsHandler) {
    // A ShowPostsHandler is necessary for the event handling of this Box.
    // A ShowPostsHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    this.#showPostsHandler = showPostsHandler;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-show-posts default-hidden framed";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-show-posts";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-show-posts";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-show-posts";
    this.buttonCancel.textContent = "Hide posts";
    // list
    this.list = document.createElement("div");
    this.list.className = "box-list-show-posts";
    // Element structure.
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    this.main.appendChild(this.list);
    // Subscribe this.#showPostsHandler to events.
    this.buttonCancel.addEventListener(
        "click",
        this.#showPostsHandler.handleButtonCancelClickEvent
            .bind(this.#showPostsHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-show-posts";
    button.textContent = "Show posts";
    button.addEventListener(
        "click",
        this.#showPostsHandler.handleButtonStartClickEvent
            .bind(this.#showPostsHandler, this),
    );
    return button;
  }

  getListElement() {
    return this.list;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class AddPostBox {
  #addPostHandler;

  /* CSS overview:
   * -------------
   *   box-main-add-post
   *   box-heading-add-post
   *   box-form-container-add-post
   *   box-form-add-post
   *   box-form-text-add-post
   *   box-form-image-add-post
   *   box-form-submit-add-post
   *   box-error-container-add-post
   *   box-error-add-post
   *   box-button-cancel-add-post
   *   box-button-start-add-post
   */
  constructor(addPostHandler) {
    // An AddPostHandler is necessary for the event handling of this Box.
    // An AddPostHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    //   - handleFormSubmitEvent(box)
    //   - handleFormImageChangeEvent(box)
    this.#addPostHandler = addPostHandler;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-add-post default-hidden framed";
    // heading
    this.heading = document.createElement("h3");
    this.heading.className = "box-heading-add-post";
    this.heading.textContent = "Add post";
    // flexLeftAligned
    this.flexLeftAligned = document.createElement("div");
    this.flexLeftAligned.className = "flex-left-aligned";
    // thumbnailContainer
    this.thumbnailContainer = document.createElement("div");
    this.thumbnailContainer.className = "flex-centered thumbnail-container";
    // thumbnail
    this.thumbnail = document.createElement("img");
    this.thumbnail.className = "thumbnail";
    this.thumbnail.alt = "";
    this.thumbnail.src = pixelPNG; // Placeholder URL.
    // formContainer
    this.formContainer = document.createElement("div");
    this.formContainer.className = "box-form-container-add-post";
    // form
    this.form = document.createElement("form");
    this.form.className = "box-form-add-post";
    this.form.onsubmit = (event) => false;
    // part1, part2, part3
    this.part1 = document.createElement("p");
    this.part2 = document.createElement("p");
    this.part3 = document.createElement("p");
    // formText
    this.formText = document.createElement("textarea");
    this.formText.className = "box-form-text-add-post";
    this.formText.name = "text";
    this.formText.placeholder = "post text";
    // formImage
    this.formImage = document.createElement("input");
    this.formImage.className = "box-form-image-add-post";
    this.formImage.name = "image";
    this.formImage.type = "file";
    this.formImage.accept = "image/*";
    // formSubmit
    this.formSubmit = document.createElement("input");
    this.formSubmit.className = "box-form-submit-add-post";
    this.formSubmit.type = "submit";
    this.formSubmit.value = "Add post";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-add-post";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-add-post";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-add-post";
    this.buttonCancel.textContent = "Cancel";
    // Element structure.
    this.main.appendChild(this.heading);
    this.main.appendChild(this.flexLeftAligned);
    this.flexLeftAligned.appendChild(this.thumbnailContainer);
    this.thumbnailContainer.appendChild(this.thumbnail);
    this.flexLeftAligned.appendChild(this.formContainer);
    this.formContainer.appendChild(this.form);
    this.form.appendChild(this.part1);
    this.form.appendChild(this.part2);
    this.form.appendChild(this.part3);
    this.part1.appendChild(this.formText);
    this.part2.appendChild(this.formImage);
    this.part3.appendChild(this.formSubmit);
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    // Subscribe this.#addPostHandler to events.
    this.form.addEventListener(
        "submit",
        this.#addPostHandler.handleFormSubmitEvent
            .bind(this.#addPostHandler, this),
    );
    this.formImage.addEventListener(
        "change",
        this.#addPostHandler.handleFormImageChangeEvent
            .bind(this.#addPostHandler, this),
    );
    this.buttonCancel.addEventListener(
        "click",
        this.#addPostHandler.handleButtonCancelClickEvent
            .bind(this.#addPostHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-add-post";
    button.textContent = "Add post";
    button.addEventListener(
        "click",
        this.#addPostHandler.handleButtonStartClickEvent
            .bind(this.#addPostHandler, this),
    );
    return button;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  getFormData() {
    return new FormData(this.form);
  }

  updateImagePreview() {
    const formData = new FormData(this.form);
    const dataObject = Object.fromEntries(formData);
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const previousURL = this.thumbnail.src;
      if (previousURL !== pixelPNG && previousURL !== "") {
        this.thumbnail.src = pixelPNG; // Placeholder URL.
        URL.revokeObjectURL(previousURL); // Release previous file reference.
        // TODO(wathne): Delete the next line.
        console.log(`Revoked URL: "${previousURL}"`);
      }
      this.thumbnail.src = URL.createObjectURL(imageFile);
    }
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class ModifyPostBox {
  #modifyPostHandler;
  #target; // A Post.

  /* CSS overview:
   * -------------
   *   box-main-modify-post
   *   box-heading-modify-post
   *   box-form-container-modify-post
   *   box-form-modify-post
   *   box-form-text-modify-post
   *   box-form-image-modify-post
   *   box-form-submit-modify-post
   *   box-error-container-modify-post
   *   box-error-modify-post
   *   box-button-cancel-modify-post
   *   box-button-start-modify-post
   */
  constructor(modifyPostHandler, target) {
    // A ModifyPostHandler is necessary for the event handling of this Box.
    // A ModifyPostHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    //   - handleFormSubmitEvent(box)
    //   - handleFormImageChangeEvent(box)
    this.#modifyPostHandler = modifyPostHandler;
    this.#target = target;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-modify-post default-hidden framed";
    // heading
    this.heading = document.createElement("h3");
    this.heading.className = "box-heading-modify-post";
    this.heading.textContent = "Modify post";
    // flexLeftAligned
    this.flexLeftAligned = document.createElement("div");
    this.flexLeftAligned.className = "flex-left-aligned";
    // thumbnailContainer
    this.thumbnailContainer = document.createElement("div");
    this.thumbnailContainer.className = "flex-centered thumbnail-container";
    // thumbnail
    this.thumbnail = document.createElement("img");
    this.thumbnail.className = "thumbnail";
    this.thumbnail.alt = "";
    this.thumbnail.src = pixelPNG; // Placeholder URL.
    // formContainer
    this.formContainer = document.createElement("div");
    this.formContainer.className = "box-form-container-modify-post";
    // form
    this.form = document.createElement("form");
    this.form.className = "box-form-modify-post";
    this.form.onsubmit = (event) => false;
    // part1, part2, part3
    this.part1 = document.createElement("p");
    this.part2 = document.createElement("p");
    this.part3 = document.createElement("p");
    // formText
    this.formText = document.createElement("textarea");
    this.formText.className = "box-form-text-modify-post";
    this.formText.name = "text";
    this.formText.placeholder = "post text";
    // formImage
    this.formImage = document.createElement("input");
    this.formImage.className = "box-form-image-modify-post";
    this.formImage.name = "image";
    this.formImage.type = "file";
    this.formImage.accept = "image/*";
    // formSubmit
    this.formSubmit = document.createElement("input");
    this.formSubmit.className = "box-form-submit-modify-post";
    this.formSubmit.type = "submit";
    this.formSubmit.value = "Modify post";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-modify-post";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-modify-post";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-modify-post";
    this.buttonCancel.textContent = "Cancel";
    // Element structure.
    this.main.appendChild(this.heading);
    this.main.appendChild(this.flexLeftAligned);
    this.flexLeftAligned.appendChild(this.thumbnailContainer);
    this.thumbnailContainer.appendChild(this.thumbnail);
    this.flexLeftAligned.appendChild(this.formContainer);
    this.formContainer.appendChild(this.form);
    this.form.appendChild(this.part1);
    this.form.appendChild(this.part2);
    this.form.appendChild(this.part3);
    this.part1.appendChild(this.formText);
    this.part2.appendChild(this.formImage);
    this.part3.appendChild(this.formSubmit);
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    // Subscribe this.#modifyPostHandler to events.
    this.form.addEventListener(
        "submit",
        this.#modifyPostHandler.handleFormSubmitEvent
            .bind(this.#modifyPostHandler, this),
    );
    this.formImage.addEventListener(
        "change",
        this.#modifyPostHandler.handleFormImageChangeEvent
            .bind(this.#modifyPostHandler, this),
    );
    this.buttonCancel.addEventListener(
        "click",
        this.#modifyPostHandler.handleButtonCancelClickEvent
            .bind(this.#modifyPostHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-modify-post";
    button.textContent = "Modify post";
    button.addEventListener(
        "click",
        this.#modifyPostHandler.handleButtonStartClickEvent
            .bind(this.#modifyPostHandler, this),
    );
    return button;
  }

  getTarget() {
    return this.#target;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  getFormData() {
    return new FormData(this.form);
  }

  updateImagePreview() {
    const formData = new FormData(this.form);
    const dataObject = Object.fromEntries(formData);
    const imageFile = dataObject["image"];
    if (imageFile instanceof File && imageFile.size !== 0) {
      const previousURL = this.thumbnail.src;
      if (previousURL !== pixelPNG && previousURL !== "") {
        this.thumbnail.src = pixelPNG; // Placeholder URL.
        URL.revokeObjectURL(previousURL); // Release previous file reference.
        // TODO(wathne): Delete the next line.
        console.log(`Revoked URL: "${previousURL}"`);
      }
      this.thumbnail.src = URL.createObjectURL(imageFile);
    }
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class DeletePostBox {
  #deletePostHandler;
  #target; // A Post.

  /* CSS overview:
   * -------------
   *   box-main-delete-post
   *   box-heading-delete-post
   *   box-form-container-delete-post
   *   box-form-delete-post
   *   box-form-submit-delete-post
   *   box-error-container-delete-post
   *   box-error-delete-post
   *   box-button-cancel-delete-post
   *   box-button-start-delete-post
   */
  constructor(deletePostHandler, target) {
    // A DeletePostHandler is necessary for the event handling of this Box.
    // A DeletePostHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    //   - handleFormSubmitEvent(box)
    this.#deletePostHandler = deletePostHandler;
    this.#target = target;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-delete-post default-hidden framed";
    // heading
    this.heading = document.createElement("h3");
    this.heading.className = "box-heading-delete-post";
    this.heading.textContent = "Delete post";
    // flexLeftAligned
    this.flexLeftAligned = document.createElement("div");
    this.flexLeftAligned.className = "flex-left-aligned";
    // formContainer
    this.formContainer = document.createElement("div");
    this.formContainer.className = "box-form-container-delete-post";
    // form
    this.form = document.createElement("form");
    this.form.className = "box-form-delete-post";
    this.form.onsubmit = (event) => false;
    // part1
    this.part1 = document.createElement("p");
    // formSubmit
    this.formSubmit = document.createElement("input");
    this.formSubmit.className = "box-form-submit-delete-post";
    this.formSubmit.type = "submit";
    this.formSubmit.value = "Delete post";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-delete-post";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-delete-post";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-delete-post";
    this.buttonCancel.textContent = "Cancel";
    // Element structure.
    this.main.appendChild(this.heading);
    this.main.appendChild(this.flexLeftAligned);
    this.flexLeftAligned.appendChild(this.formContainer);
    this.formContainer.appendChild(this.form);
    this.form.appendChild(this.part1);
    this.part1.appendChild(this.formSubmit);
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    // Subscribe this.#deletePostHandler to events.
    this.form.addEventListener(
        "submit",
        this.#deletePostHandler.handleFormSubmitEvent
            .bind(this.#deletePostHandler, this),
    );
    this.buttonCancel.addEventListener(
        "click",
        this.#deletePostHandler.handleButtonCancelClickEvent
            .bind(this.#deletePostHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-delete-post";
    button.textContent = "Delete post";
    button.addEventListener(
        "click",
        this.#deletePostHandler.handleButtonStartClickEvent
            .bind(this.#deletePostHandler, this),
    );
    return button;
  }

  getTarget() {
    return this.#target;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class RegisterBox {
  #registerHandler;

  /* CSS overview:
   * -------------
   *   box-main-register
   *   box-heading-register
   *   box-form-container-register
   *   box-form-register
   *   box-form-username-register
   *   box-form-password-register
   *   box-form-submit-register
   *   box-error-container-register
   *   box-error-register
   *   box-button-cancel-register
   *   box-button-start-register
   */
  constructor(registerHandler) {
    // A RegisterHandler is necessary for the event handling of this Box.
    // A RegisterHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    //   - handleFormSubmitEvent(box)
    this.#registerHandler = registerHandler;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-register default-hidden framed";
    // heading
    this.heading = document.createElement("h3");
    this.heading.className = "box-heading-register";
    this.heading.textContent = "Register";
    // flexLeftAligned
    this.flexLeftAligned = document.createElement("div");
    this.flexLeftAligned.className = "flex-left-aligned";
    // formContainer
    this.formContainer = document.createElement("div");
    this.formContainer.className = "box-form-container-register";
    // form
    this.form = document.createElement("form");
    this.form.className = "box-form-register";
    this.form.onsubmit = (event) => false;
    // part1, part2, part3
    this.part1 = document.createElement("p");
    this.part2 = document.createElement("p");
    this.part3 = document.createElement("p");
    // formUsername
    this.formUsername = document.createElement("input");
    this.formUsername.className = "box-form-username-register";
    this.formUsername.name = "username";
    this.formUsername.type = "text";
    this.formUsername.placeholder = "enter username";
    this.formUsername.required = true;
    // formPassword
    this.formPassword = document.createElement("input");
    this.formPassword.className = "box-form-password-register";
    this.formPassword.name = "password";
    this.formPassword.type = "password";
    this.formPassword.placeholder = "enter password";
    this.formPassword.required = true;
    // formSubmit
    this.formSubmit = document.createElement("input");
    this.formSubmit.className = "box-form-submit-register";
    this.formSubmit.type = "submit";
    this.formSubmit.value = "Register";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-register";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-register";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-register";
    this.buttonCancel.textContent = "Cancel";
    // Element structure.
    this.main.appendChild(this.heading);
    this.main.appendChild(this.flexLeftAligned);
    this.flexLeftAligned.appendChild(this.formContainer);
    this.formContainer.appendChild(this.form);
    this.form.appendChild(this.part1);
    this.form.appendChild(this.part2);
    this.form.appendChild(this.part3);
    this.part1.appendChild(this.formUsername);
    this.part2.appendChild(this.formPassword);
    this.part3.appendChild(this.formSubmit);
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    // Subscribe this.#registerHandler to events.
    this.form.addEventListener(
        "submit",
        this.#registerHandler.handleFormSubmitEvent
            .bind(this.#registerHandler, this),
    );
    this.buttonCancel.addEventListener(
        "click",
        this.#registerHandler.handleButtonCancelClickEvent
            .bind(this.#registerHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-register";
    button.textContent = "Register";
    button.addEventListener(
        "click",
        this.#registerHandler.handleButtonStartClickEvent
            .bind(this.#registerHandler, this),
    );
    return button;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  getFormData() {
    return new FormData(this.form);
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class LoginBox {
  #loginHandler;

  /* CSS overview:
   * -------------
   *   box-main-login
   *   box-heading-login
   *   box-form-container-login
   *   box-form-login
   *   box-form-username-login
   *   box-form-password-login
   *   box-form-submit-login
   *   box-error-container-login
   *   box-error-login
   *   box-button-cancel-login
   *   box-button-start-login
   */
  constructor(loginHandler) {
    // A LoginHandler is necessary for the event handling of this Box.
    // A LoginHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    //   - handleFormSubmitEvent(box)
    this.#loginHandler = loginHandler;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-login default-hidden framed";
    // heading
    this.heading = document.createElement("h3");
    this.heading.className = "box-heading-login";
    this.heading.textContent = "Login";
    // flexLeftAligned
    this.flexLeftAligned = document.createElement("div");
    this.flexLeftAligned.className = "flex-left-aligned";
    // formContainer
    this.formContainer = document.createElement("div");
    this.formContainer.className = "box-form-container-login";
    // form
    this.form = document.createElement("form");
    this.form.className = "box-form-login";
    this.form.onsubmit = (event) => false;
    // part1, part2, part3
    this.part1 = document.createElement("p");
    this.part2 = document.createElement("p");
    this.part3 = document.createElement("p");
    // formUsername
    this.formUsername = document.createElement("input");
    this.formUsername.className = "box-form-username-login";
    this.formUsername.name = "username";
    this.formUsername.type = "text";
    this.formUsername.placeholder = "enter username";
    this.formUsername.required = true;
    // formPassword
    this.formPassword = document.createElement("input");
    this.formPassword.className = "box-form-password-login";
    this.formPassword.name = "password";
    this.formPassword.type = "password";
    this.formPassword.placeholder = "enter password";
    this.formPassword.required = true;
    // formSubmit
    this.formSubmit = document.createElement("input");
    this.formSubmit.className = "box-form-submit-login";
    this.formSubmit.type = "submit";
    this.formSubmit.value = "Login";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-login";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-login";
    // extraContainer
    this.extraContainer = document.createElement("div");
    // extraHeading
    this.extraHeading = document.createElement("h4");
    this.extraHeading.textContent = "Sample login credentials:";
    // extraParagraph1
    this.extraParagraph1 = document.createElement("p");
    this.extraParagraph1.textContent =
        "username: test1 | password: asdf1234 | group: 0";
    // extraParagraph2
    this.extraParagraph2 = document.createElement("p");
    this.extraParagraph2.textContent =
        "username: test2 | password: asdf1234 | group: 0";
    // extraParagraph3
    this.extraParagraph3 = document.createElement("p");
    this.extraParagraph3.textContent =
        "username: moderator1 | password: zxcv5678 | group: 5";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-login";
    this.buttonCancel.textContent = "Cancel";
    // Element structure.
    this.main.appendChild(this.heading);
    this.main.appendChild(this.flexLeftAligned);
    this.flexLeftAligned.appendChild(this.formContainer);
    this.formContainer.appendChild(this.form);
    this.form.appendChild(this.part1);
    this.form.appendChild(this.part2);
    this.form.appendChild(this.part3);
    this.part1.appendChild(this.formUsername);
    this.part2.appendChild(this.formPassword);
    this.part3.appendChild(this.formSubmit);
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.extraContainer);
    this.extraContainer.appendChild(this.extraHeading);
    this.extraContainer.appendChild(this.extraParagraph1);
    this.extraContainer.appendChild(this.extraParagraph2);
    this.extraContainer.appendChild(this.extraParagraph3);
    this.main.appendChild(this.buttonCancel);
    // Subscribe this.#loginHandler to events.
    this.form.addEventListener(
        "submit",
        this.#loginHandler.handleFormSubmitEvent
            .bind(this.#loginHandler, this),
    );
    this.buttonCancel.addEventListener(
        "click",
        this.#loginHandler.handleButtonCancelClickEvent
            .bind(this.#loginHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-login";
    button.textContent = "Login";
    button.addEventListener(
        "click",
        this.#loginHandler.handleButtonStartClickEvent
            .bind(this.#loginHandler, this),
    );
    return button;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  getFormData() {
    return new FormData(this.form);
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}


class LogoutBox {
  #logoutHandler;

  /* CSS overview:
   * -------------
   *   box-main-logout
   *   box-heading-logout
   *   box-form-container-logout
   *   box-form-logout
   *   box-form-submit-logout
   *   box-error-container-logout
   *   box-error-logout
   *   box-button-cancel-logout
   *   box-button-start-logout
   */
  constructor(logoutHandler) {
    // A LogoutHandler is necessary for the event handling of this Box.
    // A LogoutHandler must implement the following functions:
    //   - handleButtonStartClickEvent(box)
    //   - handleButtonCancelClickEvent(box)
    //   - handleFormSubmitEvent(box)
    this.#logoutHandler = logoutHandler;
    // main
    this.main = document.createElement("div");
    this.main.className = "box-main-logout default-hidden framed";
    // heading
    this.heading = document.createElement("h3");
    this.heading.className = "box-heading-logout";
    this.heading.textContent = "Do you want to logout?";
    // flexLeftAligned
    this.flexLeftAligned = document.createElement("div");
    this.flexLeftAligned.className = "flex-left-aligned";
    // formContainer
    this.formContainer = document.createElement("div");
    this.formContainer.className = "box-form-container-logout";
    // form
    this.form = document.createElement("form");
    this.form.className = "box-form-logout";
    this.form.onsubmit = (event) => false;
    // part1
    this.part1 = document.createElement("p");
    // formSubmit
    this.formSubmit = document.createElement("input");
    this.formSubmit.className = "box-form-submit-logout";
    this.formSubmit.type = "submit";
    this.formSubmit.value = "Yes";
    // errorContainer
    this.errorContainer = document.createElement("div");
    this.errorContainer.className = "box-error-container-logout";
    // error
    this.error = document.createElement("p");
    this.error.className = "box-error-logout";
    // buttonCancel
    this.buttonCancel = document.createElement("button");
    this.buttonCancel.className = "box-button-cancel-logout";
    this.buttonCancel.textContent = "No";
    // Element structure.
    this.main.appendChild(this.heading);
    this.main.appendChild(this.flexLeftAligned);
    this.flexLeftAligned.appendChild(this.formContainer);
    this.formContainer.appendChild(this.form);
    this.form.appendChild(this.part1);
    this.part1.appendChild(this.formSubmit);
    this.main.appendChild(this.errorContainer);
    this.errorContainer.appendChild(this.error);
    this.main.appendChild(this.buttonCancel);
    // Subscribe this.#logoutHandler to events.
    this.form.addEventListener(
        "submit",
        this.#logoutHandler.handleFormSubmitEvent
            .bind(this.#logoutHandler, this),
    );
    this.buttonCancel.addEventListener(
        "click",
        this.#logoutHandler.handleButtonCancelClickEvent
            .bind(this.#logoutHandler, this),
    );
  }

  createButton() {
    const button = document.createElement("button");
    button.className = "box-button-start-logout";
    button.textContent = "Logout";
    button.addEventListener(
        "click",
        this.#logoutHandler.handleButtonStartClickEvent
            .bind(this.#logoutHandler, this),
    );
    return button;
  }

  getMainElement() {
    return this.main;
  }

  showMainElement() {
    this.main.style.display = "block";
  }

  hideMainElement() {
    this.main.style.display = "none";
  }

  setError(error) {
    this.error.textContent = error;
    this.errorContainer.style.display = "block";
  }

  clearError() {
    this.errorContainer.style.display = "none";
    this.error.textContent = "";
  }
}

