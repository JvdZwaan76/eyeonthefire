function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  console.log('ID: ' + profile.getId()); // Do not send to backend!
  console.log('Name: ' + profile.getName());
  console.log('Email: ' + profile.getEmail());
  // Show sign-out link after successful sign-in
  document.getElementById('signout-link').style.display = 'block';
  // Optionally, send the ID token to your backend for validation
  var id_token = googleUser.getAuthResponse().id_token;
  console.log('ID Token: ' + id_token);
  // Send id_token to your backend via HTTPS (not implemented here)
}

function signOut() {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
    console.log('User signed out.');
    document.getElementById('signout-link').style.display = 'none';
  });
}

// Add event listener for sign-out link
document.addEventListener('DOMContentLoaded', function () {
  const signOutLink = document.getElementById('signout-link');
  if (signOutLink) {
    signOutLink.addEventListener('click', function (event) {
      event.preventDefault();
      signOut();
    });
  }
});
