// ------------------------------------------------------------------NEW THREAD------------------------------------------------------------

let plus = false;

function NewThread() {
    
    plus = !plus;

    if(plus) {
        document.getElementById("NewThreadButton").innerHTML =
        "<i id='NewThreadButton' class='fa-solid fa-minus' onclick='NewThread()'></i>";
        document.getElementById("NewThread").innerHTML = 
        "<form action=''>" +
        "<label for='title'>Thread title:</label><br>" +
        "<input type='text' id='title' name='title' placeholder='New destination'><br><br>" +
        "<label for='description'>Description:</label><br>" +
        "<textarea type='text' id='description' name='description' rows='10' cols='81' placeholder='Descriptive paragraph...'></textarea><br><br>" +
        "<label for='image'>Upload image:</label><br>" +
        "<input type='file' id='image' name='image' accept='image/*'><br><br>" +
        "<input type='submit' value='Post' onclick='NewThreadComment()'> "
        "</form>";
    }
    
    else {
        document.getElementById("NewThreadButton").innerHTML =
        "<i id='NewThreadButton' class='fa-solid fa-plus' onclick='NewThread()'></i>"
        document.getElementById("NewThread").innerHTML = "";
    }

}

function NewThreadComment() {
    const node = document.createElement("li");
    const textnode = document.createTextNode("Thank you for submitting your post! Our moderator will review it shortly.");
    node.appendChild(textnode);
    document.getElementById("NewThreadComment").appendChild(node);
}

// ------------------------------------------------------------------OPEN THREAD------------------------------------------------------------

function openThread() {
    let articleId = document.
}

// ------------------------------------------------------------------HAMBURGER MENU------------------------------------------------------------

let logo = document.querySelector('.burgerIcon')
let menu = document.querySelector('.menu')

logo.addEventListener('click', function() {menu.classList.toggle('showmenu');});

// ------------------------------------------------------------------FORM VALIDATION------------------------------------------------------------

const form = document.getElementById('form');
const fname = document.getElementById('fname');
const lname = document.getElementById('lname');
const address = document.getElementById('address');
const ZIP = document.getElementById('ZIP');
const city = document.getElementById('city');
const phone = document.getElementById('phone');
const email = document.getElementById('email');
const confirmEmail = document.getElementById('confirmEmail');
const password = document.getElementById('password');
const repeatPassword = document.getElementById('repeatPassword');

form.addEventListener('submit', e => {
    e.preventDefault();
    validateInputs();
});

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
}

const setError = (element, message)=> {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const validateInputs = ()=> {
    const fnameValue = fname.value.trim();
    const lnameValue = lname.value.trim();
    const addressValue = address.value.trim();
    const ZIPValue = ZIP.value.trim();
    const cityValue = city.value.trim();
    const phoneValue = phone.value.trim();
    const emailValue = email.value.trim();
    const confirmEmailValue = confirmEmail.value.trim();
    const passwordValue = password.value.trim();
    const repeatPasswordValue = repeatPassword.value.trim();

    if(fnameValue === '') {
        setError(fname, 'First name is required');
    } else {
        setSuccess(fname);
    }

    if(lnameValue === '') {
        setError(lname, 'Last name is required');
    } else {
        setSuccess(lname);
    }

    if(addressValue === '') {
        setError(address, 'Address is required');
    } else if (!/[a-z]/.test(addressValue)) {
        setError(address, 'Address must contain a lower case letter')
    } else if (!/[A-Z]/.test(addressValue)) {
        setError(address, 'Address must contain an upper case letter')
    } else if (!/\d/.test(addressValue)) {
        setError(address, 'Address must contain a number')
    } else {
        setSuccess(address);
    }

    if(ZIPValue === '') {
        setError(ZIP, 'ZIP is required');
    } else if (ZIPValue.length !== 4) {
        setError(ZIP, 'Type a 4 digit ZIP code');
    } else if (/\D/.test(ZIPValue)) {
        setError(ZIP, 'Type a 4 digit ZIP code');
    } else {
        setSuccess(ZIP);
    }

    if(cityValue === '') {
        setError(city, 'City is required');
    } else {
        setSuccess(city);
    }

    if(phoneValue === '') {
        setError(phone, 'Phone is required');
    } else if (phoneValue.length !== 8) {
        setError(phone, 'Type an 8 digit phone number');
    } else if (/\D/.test(phoneValue)) {
        setError(phone, 'Type an 8 digit phone number');
    } else {
        setSuccess(phone);
    }

    if(emailValue === '') {
        setError(email, 'Email is required');
    } else if (!isValidEmail(emailValue)) {
        setError(email, 'Type a valid email');
    } else {
        setSuccess(email);
    }

    if(confirmEmailValue === '') {
        setError(confirmEmail, 'Confirming email is required');
    } else if (confirmEmailValue !== emailValue) {
        setError(confirmEmail, "Emails doesn't match")
    } else {
        setSuccess(confirmEmail);
    }

    if(passwordValue === '') {
        setError(password, 'Password is required');
    } else if (passwordValue.length < 8) {
        setError(password, 'Password must be at least 8 characters')
    } else if (!/[a-z]/.test(passwordValue)) {
        setError(password, 'Password must contain a lower case letter')
    } else if (!/[A-Z]/.test(passwordValue)) {
        setError(password, 'Password must contain an upper case letter')
    } else if (!/\d/.test(passwordValue)) {
        setError(password, 'Password must contain a number')
    } else if (!/[\p{S}\p{P}]/u.test(passwordValue)) {
         setError(password, 'Password must contain a symbol')
    } else {
        setSuccess(password);
    }

    if(repeatPasswordValue === '') {
        setError(repeatPassword, 'Repeating password is required');
    } else if (repeatPasswordValue !== passwordValue) {
        setError(repeatPassword, "Passwords doesn't match")
    } else {
        setSuccess(repeatPassword);
    }
}

