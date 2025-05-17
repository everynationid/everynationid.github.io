function onSignIn(response) {
  const email = jwt_decode(response.credential).email;
  const allowedEmails = ['youremail@gmail.com'];
  if (allowedEmails.includes(email)) {
    document.getElementById('cms').style.display = 'block';
  } else {
    alert('Access denied');
  }
}