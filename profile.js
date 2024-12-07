console.log("profile.js loaded!");

import { jwt } from './redirect.js';

const headers = {
	'Authorization': 'Bearer ' + jwt,
	'Content-Type': 'application/json',
	'Accept': '*/*',
	'Cache-Control': 'no-cache',
	'Pragma': 'no-cache',
};

const basicInfo = JSON.stringify({
	query: "query basicInfo { user { id firstName lastName}}",
	operationName: "basicInfo"
});

fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
	method: 'POST',
	headers: headers,
	body: basicInfo
})
	.then(response => response.json())
	.then(data => {
		if (data.errors) {
			console.error('GraphQL Error:', data.errors);
		} else {
			const user = data.data.user[0];
			console.log('User Data:', user);

			document.title = `${user.firstName} ${user.lastName}'s Profile`;

			const navbarBrand = document.querySelector('.navbar-brand');
			if (navbarBrand) {
				navbarBrand.textContent = `Hello, ${user.firstName}`;
			}
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});

const logoutButton = document.getElementById('Logout');
if (logoutButton) {
	logoutButton.addEventListener('click', () => {
		localStorage.removeItem('jwt');
		window.location.href = 'index.html';
	});
}