function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return {};
  }
}

function onSignIn(response) {
  // The response object contains the credential (JWT token)
  const credential = response.credential;
  const profile = parseJwt(credential);
  
  console.log('ID:', profile.sub); // User ID
  console.log('Name:', profile.name);
  console.log('Email:', profile.email);
  
  // Show sign-out link after successful sign-in
  document.getElementById('signout-link').style.display = 'block';
  
  // Optionally, send the ID token to your backend for validation
  console.log('ID Token:', credential);
  // Send id_token to your backend via HTTPS (not implemented here)
}

function signOut() {
  google.accounts.id.disableAutoSelect();
  console.log('User signed out.');
  document.getElementById('signout-link').style.display = 'none';
}
