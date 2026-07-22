// =============================
// PAGE ACCESS PROTECTION
// =============================

function protectPage(requiredRole){


    const user =
    JSON.parse(
        localStorage.getItem("user")
    );


    // Check if user is logged in

    if(!user){

        alert(
            "Please login first."
        );


        window.location.href =
        "auth.html";

        return false;
    }



    // Check role permission

    if(user.role.toUpperCase() !== requiredRole.toUpperCase()){


        alert(
            "Access denied. You do not have permission to access this page."
        );


        window.location.href =
        "auth.html";


        return false;

    }



    return true;

}




// =============================
// LOGOUT FUNCTION
// =============================

function logout(){


    localStorage.removeItem(
        "user"
    );


    window.location.href =
    "auth.html";

}
