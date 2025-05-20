function onSignIn(response) {
  // The response parameter contains the ID token as response.credential
  const idToken = response.credential;
  console.log('ID Token:', idToken);

  // Decode the JWT token to get user info
  const payload = parseJwt(idToken);
  console.log('User ID:', payload.sub);
  console.log('Name:', payload.name);
  console.log('Email:', payload.email);

  // Show sign-out link after successful sign-in
  document.getElementById('signout-link').style.display = 'block';
}

// Helper function to decode JWT token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

function signOut() {
  // Using Google Identity Services, sign-out is typically handled by invalidating the token on the client
  console.log('User signed out.');
  document.getElementById('signout-link').style.display = 'none';
  // Optionally, you can revoke the token on your backend if needed
  // For client-side only, clear any stored state
  google.accounts.id.disableAutoSelect();
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
