function onSignIn(response) {
  const email = jwt_decode(response.credential).email;
  const allowedEmails = ['ict@everynation.id']; // <-- your email
  if (allowedEmails.includes(email)) {
    document.getElementById('cms').style.display = 'block';
    document.querySelector('.g_id_signin').style.display = 'none';
  } else {
    alert('Access denied');
  }
}
