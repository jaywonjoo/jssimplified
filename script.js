// TODO: Select all elements needed
//    Use the HTML to figure out what classes/ids will work best for selecting each element

const form = document.querySelector("#form");
const username = document.getElementById("username");
const errors = document.querySelector(".errors");
const errorList = document.querySelector(".errors-list");
const password = document.getElementById("password");
const passwordCheck = document.getElementById("password-confirmation");
const terms = document.getElementById("terms");

// TODO: Create an event listener for when the form is submitted and do the following inside of it.

form.addEventListener("submit", (e) => {
  e.preventDefault();
  //console.log("blah")

  //    TODO: Create an array to store all error messages and clear any old error messages
  let errorMessages = [];
  //errorList.appendChild(errorMessages);

  //    TODO: Define the following validation checks with appropriate error messages
  //      1. Ensure the username is at least 6 characters long

  console.log(username.value.length);
  if (username.value.length < 6) {
    //console.log("blah")
    errors.classList.add("show");

    let newListItem = document.createElement("li");
    //newListItem.classList.add("one");
    let usernameLengthWarning = document.createTextNode(
      "Username must be at least 6 characters long"
    );
    //d.textcontent="butts";
    newListItem.appendChild(usernameLengthWarning);
    errorList.appendChild(newListItem);
  } else if (username.value.length > 5) {
    clearErrors();
  }

  //      2. Ensure the password is at least 10 characters long
  if (password.value.length < 10) {
    console.log(password);
    errors.classList.add("show");

    let newListItem = document.createElement("li");
    //newListItem.classList.add("two");
    let passwordLengthWarning = document.createTextNode(
      "Password must be at least 10 characters long"
    );

    newListItem.appendChild(passwordLengthWarning);
    errorList.appendChild(newListItem);
  }

  //      3. Ensure the password and confirmation password match
  if (password.value !== passwordCheck.value) {
    errors.classList.add("show");

    let newListItem = document.createElement("li");
    //newListItem.classList.add("three");
    let passwordMismatchWarning = document.createTextNode(
      "Passwords do not match"
    );

    newListItem.appendChild(passwordMismatchWarning);
    errorList.appendChild(newListItem);
  }

  //      4. Ensure the terms checkbox is checked
  if (!terms.checked) {
    errors.classList.add("show");

    let newListItem = document.createElement("li");
    //newListItem.classList.add("four");
    let termsChecked = document.createTextNode(
      "Please agree to our terms and conditions"
    );

    newListItem.appendChild(termsChecked);
    errorList.appendChild(newListItem);
  }

  //    TODO: If there are any errors then prevent the form from submitting and show the error messages
});

// TODO: Define this function
function clearErrors() {
  // Loop through all the children of the error-list element and remove them
  // IMPORTANT: This cannot be done with a forEach loop or a normal for loop since as you remove children it will modify the list you are looping over which will not work
  // I recommend using a while loop to accomplish this task
  // This is the trickiest part of this exercise so if you get stuck and are unable to progress you can also set the innerHTML property of the error-list to an empty string and that will also clear the children. I recommend trying to accomplish this with a while loop, though, for practice.
  // Also, make sure you remove the show class to the errors container
}

// TODO: Define this function
function showErrors(errorMessages) {
  // Add each error to the error-list element
  // Make sure to use an li as the element for each error
  // Also, make sure you add the show class to the errors container
}
