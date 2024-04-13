function f1() { 
	//function to make the text bold using DOM method 
	document.getElementById("description").style.fontWeight = "bold"; 
} 

function f2() { 
	//function to make the text italic using DOM method 
	document.getElementById("description").style.fontStyle = "italic"; 
} 

function f3() { 
	//function to make the text alignment left using DOM method 
	document.getElementById("description").style.textAlign = "left"; 
} 

function f4() { 
  //function to make the text alignment center using DOM method 
  document.getElementById("description").style.textAlign = "center"; 
} 


function f5() { 
	//function to make the text alignment right using DOM method 
	document.getElementById("description").style.textAlign = "right"; 
} 

function f9() { 
	//function to make the text back to normal by removing all the methods applied 
	//using DOM method 
	document.getElementById("description").style.fontWeight = "normal"; 
	document.getElementById("description").style.textAlign = "left"; 
	document.getElementById("description").style.fontStyle = "normal"; 
	document.getElementById("description").style.textTransform = "capitalize"; 
	document.getElementById("description").value = " "; 
}

function openCity(cityName, elmnt, color) {
  // Hide all elements with class="tabcontent" by default */
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the background color of all tablinks/buttons
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }

  // Show the specific tab content
  document.getElementById(cityName).style.display = "block";

  // Add the specific color to the button used to open the tab content
  elmnt.style.backgroundColor = color;
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }
  });
}

