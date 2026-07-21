document.addEventListener(
"DOMContentLoaded",
()=>{


lucide.createIcons();



const user =
JSON.parse(
localStorage.getItem("currentUser")
);



if(user){

console.log(
"Logged JMO:",
user
);

}



});
