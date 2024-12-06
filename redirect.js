console.log("redirect.js loaded!");

const jwt = localStorage.getItem('jwt');

if (!jwt) {
	if (window.location.pathname !== '/index.html') {
		window.location.href = '/index.html';
	}
} else {
	if (window.location.pathname !== '/profile.html') {
		window.location.href = '/profile.html';
	}
}