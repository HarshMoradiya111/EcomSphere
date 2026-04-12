// EcomSphere - Auth Page JavaScript
// Handles the animated login/register form toggle

document.addEventListener('DOMContentLoaded', function () {
  const wrapper = document.querySelector('.wrapper');
  const loginLink = document.querySelector('.login-link');
  const registerLink = document.querySelector('.register-link');

  if (registerLink) {
    registerLink.addEventListener('click', function (e) {
      e.preventDefault();
      if (wrapper) wrapper.classList.add('active');
    });
  }

  if (loginLink) {
    loginLink.addEventListener('click', function (e) {
      e.preventDefault();
      if (wrapper) wrapper.classList.remove('active');
    });
  }
});
