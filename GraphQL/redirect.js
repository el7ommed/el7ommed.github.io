console.log("redirect.js loaded!");

export var jwt;

if (!localStorage.getItem('jwt')) {
	if (window.location.pathname !== '/index.html') {
		window.location.href = '/index.html';
	}
} else {
	if (window.location.pathname !== '/profile.html') {
		window.location.href = '/profile.html';
	}
}

if (localStorage.getItem("jwt")) {
	jwt = localStorage.getItem("jwt").slice(1, -1)
}

export function handleExpiredJWT(response) {
	if (response.errors) {
		const error = response.errors.find(
			(err) => err.extensions?.code === "invalid-jwt" && err.message.includes("JWTExpired")
		);

		if (error) {
			console.error("JWT expired:", error);
			localStorage.removeItem("jwt");
			window.location.href = "/index.html";
		}
	}
}