// =============================
// PAGE ACCESS PROTECTION
// =============================

function protectPage(requiredRole){


    const currentUser =
    JSON.parse(
        localStorage.getItem("currentUser")
    );


    // Check if user is logged in

    if(!currentUser){

        alert(
            "Please login first."
        );


        window.location.href =
        "auth.html";

        return false;
    }



    // Check role permission

    if(currentUser.role !== requiredRole){


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
        "currentUser"
    );


    window.location.href =
    "auth.html";

}
