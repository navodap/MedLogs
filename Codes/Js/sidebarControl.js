document.addEventListener(
"DOMContentLoaded",
()=>{


const user =
JSON.parse(
localStorage.getItem("currentUser")
);


if(!user) return;



const navItems =
document.querySelectorAll(".nav-item");



navItems.forEach(item=>{


    const roles =
    item.dataset.roles;


    if(!roles) return;



    const allowedRoles =
    roles.split(",");



    if(!allowedRoles.includes(user.role)){


        item.style.pointerEvents="none";

        item.style.opacity="0.45";

        item.style.cursor="not-allowed";

        item.title="Access denied";


    }


});



});
