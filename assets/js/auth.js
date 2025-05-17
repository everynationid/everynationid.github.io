function onSignIn(googleUser) {
  const profile = googleUser.getBasicProfile();
  const email = profile.getEmail();
  
  // Allow only specific emails
  const allowedEmails = ["admin@everynation.id"];
  if (allowedEmails.includes(email)) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("editor").style.display = "block";
  } else {
    alert("Access denied. You are not authorized.");
  }
}

function signOut() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(() => {
    alert("You have been signed out.");
    document.getElementById("auth").style.display = "block";
    document.getElementById("editor").style.display = "none";
  });
}