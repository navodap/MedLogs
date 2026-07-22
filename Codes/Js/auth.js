document.addEventListener("DOMContentLoaded", () => {


    // Load icons
    lucide.createIcons();



    const loginForm = document.getElementById("loginForm");

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const rememberMeInput = document.getElementById("rememberMe");

    const passwordToggle = document.getElementById("passwordToggle");

    const forgotPassword = document.getElementById("forgotPassword");

    const loginButton = document.getElementById("loginButton");


    const usernameError =
        document.getElementById("usernameError");

    const passwordError =
        document.getElementById("passwordError");


    const formStatus =
        document.getElementById("formStatus");





    /*
    =====================================
        LOAD REMEMBERED USER
    =====================================
    */


    const savedUsername =
        localStorage.getItem("forensicUsername");


    if(savedUsername){

        usernameInput.value = savedUsername;

        rememberMeInput.checked = true;

    }







    /*
    =====================================
        SHOW / HIDE PASSWORD
    =====================================
    */


    passwordToggle.addEventListener(
        "click",
        ()=>{


            if(passwordInput.type === "password"){


                passwordInput.type="text";


                passwordToggle.innerHTML =
                '<i data-lucide="eye-off"></i>';


            }

            else{


                passwordInput.type="password";


                passwordToggle.innerHTML =
                '<i data-lucide="eye"></i>';

            }



            lucide.createIcons();


        }
    );









    /*
    =====================================
        CLEAR ERRORS
    =====================================
    */


    usernameInput.addEventListener(
        "input",
        ()=>{

            clearInputError(
                usernameInput,
                usernameError
            );

        }
    );



    passwordInput.addEventListener(
        "input",
        ()=>{

            clearInputError(
                passwordInput,
                passwordError
            );

        }
    );








    /*
    =====================================
        FORGOT PASSWORD
    =====================================
    */


    forgotPassword.addEventListener(
        "click",
        (event)=>{


            event.preventDefault();


            showStatus(
            "Please contact the system administrator to reset your password.",
            "success"
            );


        }
    );









    /*
    =====================================
        LOGIN
    =====================================
    */


    loginForm.addEventListener(
        "submit",
        async(event)=>{


        event.preventDefault();



        clearAllErrors();

        hideStatus();





        const username =
        usernameInput.value.trim();



        const password =
        passwordInput.value;



        const rememberMe =
        rememberMeInput.checked;





        let valid=true;







        // Username validation

        if(!username){


            showInputError(
                usernameInput,
                usernameError,
                "Username is required."
            );


            valid=false;


        }






        // Password validation

        if(!password){


            showInputError(
                passwordInput,
                passwordError,
                "Password is required."
            );


            valid=false;


        }






        if(!valid){


            showStatus(
            "Please correct the highlighted fields.",
            "error"
            );


            return;


        }






        if(rememberMe){


            localStorage.setItem(
                "forensicUsername",
                username
            );


        }

        else{


            localStorage.removeItem(
                "forensicUsername"
            );


        }







        setLoadingState(true);







        try{



            // fake loading delay

            await new Promise(
                resolve =>
                setTimeout(resolve,1000)
            );








            /*
            =====================================
                FIND USER FROM users.js
            =====================================
            */


            const user =
            users.find(

                account =>

                account.username === username &&

                account.password === password

            );







            if(!user){


                throw new Error(
                    "Invalid username or password."
                );


            }








            /*
            =====================================
                SAVE LOGIN USER
            =====================================
            */


            localStorage.setItem(

                "currentUser",

                JSON.stringify(user)

            );







            showStatus(

            `Login successful. Welcome ${user.name}.`,

            "success"

            );







            console.log(
                "Logged user:",
                user
            );








            /*
            =====================================
                ROLE REDIRECT
            =====================================
            */


            setTimeout(()=>{



                switch(user.role){



                    case "ADMIN":


                        window.location.href =
                        "AdminDashboard.html";


                        break;







                    case "JMO":


                        window.location.href =
                        "JMODashboard.html";


                        break;







                    case "ASSISTANT_JMO":


                        window.location.href =
                        "AssistantJMODashboard.html";


                        break;







                    case "DOCTOR":


                        window.location.href =
                        "DoctorDashboard.html";


                        break;







                    case "LAB":


                        window.location.href =
                        "LabDashboard.html";


                        break;







                    case "CLERK":


                        window.location.href =
                        "ClerkDashboard.html";


                        break;







                    default:


                        alert(
                        "No dashboard assigned."
                        );



                }




            },1000);







        }



        catch(error){



            showStatus(

                error.message ||

                "Login failed."

            ,

            "error"

            );



        }






        finally{


            setLoadingState(false);


        }





    });













    /*
    =====================================
        FUNCTIONS
    =====================================
    */



    function showInputError(
        input,
        errorElement,
        message
    ){


        input
        .closest(".input-container")
        .classList
        .add("invalid");



        errorElement.textContent =
        message;



    }







    function clearInputError(
        input,
        errorElement
    ){


        input
        .closest(".input-container")
        .classList
        .remove("invalid");



        errorElement.textContent="";


    }








    function clearAllErrors(){


        clearInputError(
            usernameInput,
            usernameError
        );


        clearInputError(
            passwordInput,
            passwordError
        );


    }









    function showStatus(
        message,
        type
    ){


        formStatus.textContent =
        message;



        formStatus.className =
        `form-status ${type}`;


    }







    function hideStatus(){


        formStatus.textContent="";


        formStatus.className =
        "form-status";


    }








    function setLoadingState(
        loading
    ){



        loginButton.disabled =
        loading;




        if(loading){



            loginButton.innerHTML =
            `
            <span class="loading-spinner"></span>
            <span>Logging in...</span>
            `;



        }

        else{


            loginButton.innerHTML =
            `
            <i data-lucide="log-in"></i>
            <span>Login</span>
            `;



            lucide.createIcons();



        }




    }





});

document
.getElementById("loginForm")
.addEventListener(
    "submit",
    function(event){

        event.preventDefault();

        loginUser();

    }
);

async function loginUser(){

    const username =
    document.getElementById("username").value;


    const password =
    document.getElementById("password").value;



    const response =
    await fetch(
        "http://127.0.0.1:5000/api/login",
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                username:username,

                password:password

            })

        }
    );


    const result =
    await response.json();



    if(result.success){

        localStorage.setItem(
            "user",
            JSON.stringify(result.user)
        );


        if(result.user.role==="Admin"){

            window.location.href=
            "AdminDashboard.html";

        }

        else if(result.user.role==="Consultant JMO"){

            window.location.href=
            "JMODashboard.html";

        }


    }

    else{

        alert(result.message);

    }

}