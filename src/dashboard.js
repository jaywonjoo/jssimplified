import { initializeApp } from 'firebase/app';
import {
    getFirestore, collection, onSnapshot,
    addDoc, deleteDoc, doc, serverTimestamp, Firestore, query,
  where, getDoc, orderBy, connectFirestoreEmulator, 
  updateDoc, arrayUnion, arrayRemove,
} from 'firebase/firestore';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import "./dashboard.css";
import "./dashboard800.css";
import "./nav.css";
import "./darkmode.css";


const firebaseConfig = {
  apiKey: "AIzaSyAgs-sGBJrnqvlOBqMbZr_E1hWYJoofA2c",
  authDomain: "hound-e43f0.firebaseapp.com",
  projectId: "hound-e43f0",
  storageBucket: "hound-e43f0.appspot.com",
  messagingSenderId: "361705338046",
  appId: "1:361705338046:web:f04df4040689f429aa9aef",
};

// const button = document.getElementById("button");
const projectContainer = document.querySelector("#project-container");
const sharedProjectContainer = document.querySelector("#shared-project-container");


// const newProject = document.createElement("div");

// const modal = document.querySelector("#modal");
// const openModalButton = document.querySelector("#open-modal-btn");
// const closeModalButton = document.querySelector("#close-modal-btn");
// const overlay = document.getElementsByClassName("overlay");

// init firebase app
initializeApp(firebaseConfig);

const modal = document.getElementsByClassName("modal");
const modalBtnMulti = document.getElementsByClassName("open-modal-btn");
const overlay = document.getElementsByClassName("overlay");


// init services
const db = getFirestore();

// collection ref
const colRef = collection(db, "projects");

// FEATURE: SECURITY WALL
const auth = getAuth();
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("body").style.display = "block";
  } else {
    window.location.replace("signin.html");
  }
});

// FEATURE: LOGOUT BUTTON
const logoutButton = document.querySelector("#logoutButton");
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      console.log("the user signed out");
      window.location.href = "signin.html";
    })
    .catch((err) => {
      console.log(err.message);
    });
});


// // FEATURE: USER ICON & THEME ************************************************************************************************************************
const darkModeBtn = document.querySelector("#darkModeBtn")
const transparent = document.querySelectorAll(".transparent")
const solid = document.querySelectorAll(".solid")
const button = document.querySelectorAll(".button")
const logo = document.querySelectorAll(".logo")
const themeBtn = document.querySelector("#themeBtn")

// const ProjectUsersDocRef = doc(db, 'projects', projectID)
// // loadBackground()

onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      const userRef = collection(db, 'users')

      const userCreatorDocRef = query(userRef, where("uid", "==", uid));
      onSnapshot(userCreatorDocRef, (snapshot) => {
        snapshot.docs.forEach((docs) => {

            let userListOne = []
            userListOne.push({ ...docs.data(), id: docs.id });

            const navUserIcon = document.querySelector(".nav-user-icon")
            navUserIcon.innerText = (userListOne[0].firstName.charAt(0) + userListOne[0].lastName.charAt(0));

            let lightString = String("light")
            let darkString = String("dark")

            // // SUBFEATURE: SET THEME ********************************************************************************
            if (userListOne[0].theme == lightString) {
                setThemeLight()
                themeBtn.innerHTML = "Dark Mode"
                    console.log("blah")
            } else {
                setThemeDark()
                themeBtn.innerHTML = "Light Mode"
            console.log("blee")

            }

            // // SUBFEATURE: SET THEME ********************************************************************************
            
            // // // SUBFEATURE: CHANGE THEME ********************************************************************************


            const currentUid = userListOne[0].id
            const currentUserDocRef = doc(db, 'users', currentUid)

            darkModeBtn.addEventListener("click", (e) => {
                e.stopPropagation()

                if (userListOne[0].theme == lightString) {
                    updateDoc(currentUserDocRef, {
                        theme: "dark"
                    })
                    // setThemeLight()
                    // themeBtn.innerHTML = "Dark Mode"
                        // console.log("blah")
                } else {
                    updateDoc(currentUserDocRef, {
                        theme: "light"
                    })
                    console.log("bligg")
                }
            })
            
            // // // SUBFEATURE: CHANGE THEME ********************************************************************************
        })
    })
    }
})



// your projects queries
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    const userProjects = query(colRef, where("creator", "==", uid));


    const sharedProjects = query(colRef, where("collaborators", "==", uid));


    // realtime collection data
    let i = 0;
    onSnapshot(userProjects, (snapshot) => {
      clearProjects();

      let projects = [];
      snapshot.docs.forEach((doc) => {
        projects.push({ ...doc.data(), id: doc.id });
      });

      for (i = 0; i < projects.length; i++) {
        const newProject = document.createElement("div");
        projectContainer.appendChild(newProject);
        newProject.innerText = projects[i].name;
        newProject.classList.add("project-card");
        const fetchedBackgroundURL = projects[i].background;
        newProject.setAttribute("style", "background-image: url('"+ fetchedBackgroundURL +"'); background-size: cover;  background-position: 50%")
        const newProjectId = document.createElement("div");
        newProject.appendChild(newProjectId);
        newProjectId.innerText = projects[i].id;
        newProjectId.classList.add("project-id-card");

        // // click on div to redirect user to another page
        // newProject.addEventListener("click", (e) => {
        //   window.location.href="project-page.html?project=coyote";
        // })
      }

      // click on div to redirect user to project specific page
      const projectCards = document.querySelectorAll(".project-card");
      projectCards.forEach((card) => {
        card.addEventListener("click", () => {
          const result = card.lastChild.textContent;
          const projectPage = ["project-page.html?project=" + result];
          // console.log(projectPage)
          // console.log(result);
          window.location.href = projectPage;
        });
        
      });

      
      console.log(projects);
    });

    
    // ...
  } else {
    // User is signed out
    // ...
  }
});


// Make tickets clear and repopulate after deletion
function clearProjects() {
  while (projectContainer.children[0] != null) {
    projectContainer.removeChild(projectContainer.children[0]);
  }
}

// **************************************************************************************** //


// 2. Click on "Create Project" button to
const addProjectForm = document.querySelector(".modal-create-project-button");
// a. Write the created project to Firestore (and reset the form after it's been submitted)
addProjectForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // outputs current user id ************************************
  const user = auth.currentUser;
  if (user !== null) {
    // The user object has basic properties such as display name, email, etc.
    // const displayName = user.displayName;
    // const email = user.email;
    // const photoURL = user.photoURL;
    // const emailVerified = user.emailVerified;

    // The user's ID, unique to the Firebase project. Do NOT use
    // this value to authenticate with your backend server, if
    // you have one. Use User.getToken() instead.
    const uid = user.uid;
    console.log(uid);

    // ***********************************************************

    addDoc(colRef, {
      name: addProjectForm.name.value,
      creator: uid,
      background: "",
    }).then(() => {
      addProjectForm.reset();
      closeModal();

    });
  }

  createProjectDiv();

});
// b. Create a div for the created project to live in
// BUG: OVERWRITES EXISTING DIV INSTEAD OF CREATING A NEW ONE???
function createProjectDiv() {
  // const projectContainer = document.querySelector("#project-container");
  // const newProject = document.createElement("div");
  const newProject = document.createElement("div");
  projectContainer.appendChild(newProject);
  newProject.innerText = addProjectForm.name.value;
  newProject.classList.add("project-card");

  closeModal();
}
// 3. Close the modal
function closeModal() {
  const overlays = document.querySelectorAll(".overlay");
  overlays.forEach((overlay) => {
      overlay.classList.remove("open")
  })

  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
      modal.classList.remove("open")
  })
}

// BONUS 4. Click on overlay to cancel operation
// overlay.addEventListener("click", closeModal);

// **************************************************************************************** //

// FEATURE: Deleting Documents
const deleteProjectForm = document.querySelector(".delete");
deleteProjectForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const docRef = doc(db, "projects", deleteProjectForm.id.value);
  deleteDoc(docRef).then(() => {
    deleteProjectForm.reset();
  });
});







onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    console.log(uid)
    // const userProjects = query(colRef, where("creator", "==", uid));
    const sharedProjects = query(colRef, where("collaborators", 'array-contains', uid));

    // realtime collection data
    let i = 0;
onSnapshot(sharedProjects, (snapshot) => {
  clearSharedProjects();

  let sharedProjectsArray = [];
  snapshot.docs.forEach((doc) => {
    sharedProjectsArray.push({ ...doc.data(), id: doc.id });
  });

  for (i = 0; i < sharedProjectsArray.length; i++) {
    const newProjectUl = document.createElement("ul");
    sharedProjectContainer.appendChild(newProjectUl);
    
    const newProject = document.createElement("li");
    newProjectUl.appendChild(newProject);
    // newProject.innerText = sharedProjectsArray[i].name;
    newProject.classList.add("project-card");
    const fetchedBackgroundURL = sharedProjectsArray[i].background;
    newProject.setAttribute("style", "background-image: url('"+ fetchedBackgroundURL +"'); background-size: cover; background-position: 50%")


    const cardFadeOverlay = document.createElement("span")
    newProject.appendChild(cardFadeOverlay);
    cardFadeOverlay.classList.add("card-fade-overlay");

    const cardContentOverlay = document.createElement("span")
    newProject.appendChild(cardContentOverlay);
    cardContentOverlay.classList.add("card-content-overlay");

    const cardContentOverlayProjectTitle = document.createElement("div")
    cardContentOverlay.appendChild(cardContentOverlayProjectTitle);
    cardContentOverlayProjectTitle.innerText = sharedProjectsArray[i].name;
    cardContentOverlayProjectTitle.classList.add("card-content-overlay-project-title");

    const cardContentOverlayBottomRow = document.createElement("div")
    cardContentOverlay.appendChild(cardContentOverlayBottomRow);
    cardContentOverlayBottomRow.classList.add("card-content-overlay-bottom-row");
    // const favoritebuttonContainer = document.createElement("div");

    const cardContentOverlayFavoriteBtnContainer = document.createElement("div")
    cardContentOverlayBottomRow.appendChild(cardContentOverlayFavoriteBtnContainer);
    cardContentOverlayFavoriteBtnContainer.classList.add("card-content-overlay-favorite-btn-container");
    // const favoritebuttonContainer = document.createElement("div");

    const cardContentOverlayFavoriteBtnStar = document.createElement("img")
    cardContentOverlayFavoriteBtnStar.classList.add("card-content-overlay-favorite-btn-star")
    cardContentOverlayFavoriteBtnStar.setAttribute("src", "https://www.clipartmax.com/png/full/281-2811663_gold-star-icon-png-transparent.png")
    // cardContentOverlayFavoriteBtnStar.setAttribute("src", "../images/icon_star_outline.svg")
    cardContentOverlayFavoriteBtnContainer.appendChild(cardContentOverlayFavoriteBtnStar)

    const newProjectId = document.createElement("div");
    newProject.appendChild(newProjectId);
    newProjectId.innerText = sharedProjectsArray[i].id;
    newProjectId.classList.add("project-id-card");

    // // click on div to redirect user to another page
    // newProject.addEventListener("click", (e) => {
    //   window.location.href="project-page.html?project=coyote";
    // })
  }

  // click on div to redirect user to project specific page
  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card) => {
    card.addEventListener("click", () => {
      const result = card.lastChild.textContent;
      const projectPage = ["project-page.html?project=" + result];
      // console.log(projectPage)
      // console.log(result);
      window.location.href = projectPage;
    });
  });

  console.log(sharedProjectsArray);
});
    // ...
  } else {
    // User is signed out
    // ...
  }
});

// Make tickets clear and repopulate after deletion
function clearSharedProjects() {
  while (sharedProjectContainer.children[0] != null) {
    sharedProjectContainer.removeChild(sharedProjectContainer.children[0]);
  }
}


// MOBILE FEATURE: OPEN DASHBOARD ************************************************************************************************************************

const sidebarButton = document.querySelector(".sidebar-button");
const dashboardMasterMobile = document.querySelector(".dashboard-master")
const overlayer = document.querySelector(".blurred-overlay");


sidebarButton.addEventListener("click", () => {
    dashboardMasterMobile.setAttribute("style", "left: 0")
    overlayer.setAttribute("style", "position: fixed; height: 100vh; left: 0%;")
    overlayer.classList.add("open")

})

// MOBILE FEATURE: OPEN DASHBOARD ************************************************************************************************************************

// MOBILE FEATURE: CLOSE DASHBOARD ************************************************************************************************************************

dashboardMasterMobile.addEventListener("click", () => {
    dashboardMasterMobile.removeAttribute("style", "left")
    overlayer.classList.remove("open")
})

overlayer.addEventListener("click", () => {
    dashboardMasterMobile.removeAttribute("style", "left")
    overlayer.classList.remove("open")
})

// MOBILE FEATURE: CLOSE DASHBOARD ************************************************************************************************************************



// FEATURE: MULTIPLE MODALS ************************************************************************************************************************
// const modal = document.getElementsByClassName("modal");
// const modalBtnMulti = document.getElementsByClassName("open-modal-btn");
// const overlay = document.getElementsByClassName("overlay");


// When the user clicks the button, open the modal
setDataIndex()
function setDataIndex() {
  let i = 0
  for (i = 0; i < modalBtnMulti.length; i++)
  {
      modalBtnMulti[i].setAttribute('data-index', i);
      modal[i].setAttribute('data-index', i);
      overlay[i].setAttribute('data-index', i);
  }

  for (i = 0; i < modalBtnMulti.length; i++)
  {
      modalBtnMulti[i].onclick = function() {
          let ElementIndex = this.getAttribute('data-index');
          modal[ElementIndex].classList.toggle("open")
          overlay[ElementIndex].classList.toggle("open")
      };
  }
}

closeOverlay()
function closeOverlay() {
  for (let i = 0; i < overlay.length; i++)
  {
      overlay[i].onclick = function() {
          let ElementIndex = this.getAttribute('data-index');
      //   modalparent[ElementIndex].classList.remove("hidden")
        modal[ElementIndex].classList.remove("open")
        overlay[ElementIndex].classList.remove("open")
      };
  }
}

// FEATURE: MULTIPLE MODALS ************************************************************************************************************************


// // FEATURE: CUSTOM PROJECT BACKGROUND ************************************************************************************************************************

// const body = document.querySelector("#body")
// loadBackground()

// function loadBackground() {
//     getDoc(ProjectUsersDocRef).then((snapshot) => {
// // TEST PASS: DOESN'T FIRE EVERY TIME THEME IS CHANGED
//         let fetchedBackgroundURL = snapshot.data().background;
//         body.setAttribute("style", "background-image: url('"+ fetchedBackgroundURL +"')")
//     })
// }


// // Unhide project background input when clicked
// const setBackgroundFormBtn = document.querySelector("#setBackgroundFormBtn")
// const setBackgroundFormBtnInput = document.querySelector("#setBackgroundFormBtnInput")
// setBackgroundFormBtn.addEventListener("click", () => {
//     setBackgroundFormBtnInput.classList.toggle("hidden")
// })

// // Write background to firebase
// const setBackgroundForm = document.querySelector("#setBackgroundForm")
// setBackgroundForm.addEventListener("submit", (e) => {
//     e.preventDefault()
//     updateDoc(ProjectUsersDocRef, {
//         background: setBackgroundForm.inputtedBackgroundURL.value
//     })
//     .then(() => {
//         loadBackground()
//         setBackgroundForm.reset()
//         setBackgroundFormBtnInput.classList.toggle("hidden")
//     })
// })

// // FEATURE: CUSTOM PROJECT BACKGROUND ************************************************************************************************************************


// FEATURE: DARK MODE ************************************************************************************************************************




  




// function to set theme to light on page load
function setThemeLight() {
    for (let i = 0; i < transparent.length; i++) {
        transparent[i].classList.add("light-mode-transparent")
        transparent[i].classList.remove("dark-mode-transparent")
    }

    for (let i = 0; i < solid.length; i++) {
        solid[i].classList.add("light-mode-solid")
        solid[i].classList.remove("dark-mode-solid")
    }

    for (let i = 0; i < button.length; i++) {
        button[i].classList.add("light-mode-button")
        button[i].classList.remove("dark-mode-button")
    }

    for (let i = 0; i < logo.length; i++) {
        logo[i].classList.add("light-mode-logo")
        logo[i].classList.remove("dark-mode-logo")
    }
}

// function to set theme to dark on page load
function setThemeDark() {
    for (let i = 0; i < transparent.length; i++) {
        transparent[i].classList.add("dark-mode-transparent")
        transparent[i].classList.remove("light-mode-transparent")
    }

    for (let i = 0; i < solid.length; i++) {
        solid[i].classList.add("dark-mode-solid")
        solid[i].classList.remove("light-mode-solid")
    }

    for (let i = 0; i < button.length; i++) {
        button[i].classList.add("dark-mode-button")
        button[i].classList.remove("light-mode-button")
    }

    for (let i = 0; i < logo.length; i++) {
        logo[i].classList.add("dark-mode-logo")
        logo[i].classList.remove("light-mode-logo")
    }
}

// // function to set theme to light on page load
// function toggleTheme() {
//     for (let i = 0; i < transparent.length; i++) {
//         transparent[i].classList.toggle("light-mode-transparent")
//         transparent[i].classList.toggle("dark-mode-transparent")
//     }

//     for (let i = 0; i < solid.length; i++) {
//         solid[i].classList.toggle("light-mode-solid")
//         solid[i].classList.toggle("dark-mode-solid")
//     }

//     for (let i = 0; i < button.length; i++) {
//         button[i].classList.toggle("light-mode-button")
//         button[i].classList.toggle("dark-mode-button")
//     }

//     for (let i = 0; i < logo.length; i++) {
//         logo[i].classList.toggle("light-mode-logo")
//         logo[i].classList.toggle("dark-mode-logo")
//     }
// }



// FEATURE: DARK MODE ************************************************************************************************************************
