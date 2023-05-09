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

let logo = document.querySelector('.burgerIcon')
let menu = document.querySelector('.menu')

logo.addEventListener('click', function() {menu.classList.toggle('showmenu');});