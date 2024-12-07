console.log("redirect.js loaded!");

export const jwt = localStorage.getItem('jwt').slice(1, -1)

if (!jwt) {
	if (window.location.pathname !== '/index.html') {
		window.location.href = '/index.html';
	}
} else {
	if (window.location.pathname !== '/profile.html') {
		window.location.href = '/profile.html';
	}
}