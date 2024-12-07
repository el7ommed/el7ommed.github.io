console.log("profile.js loaded!");

import { jwt } from './redirect.js';

let currUser = {
	id: 0,
	login: '',
	firstName: '',
	lastName: ''
};

const headers = {
	'Authorization': 'Bearer ' + jwt,
	'Content-Type': 'application/json',
	'Accept': '*/*',
	'Cache-Control': 'no-cache',
	'Pragma': 'no-cache',
};

const basicInfo = JSON.stringify({
	query: `query basicInfo {
		user {
			id
			login
			firstName
			lastName
		}
	}`,
	operationName: "basicInfo"
});

const lastAuditsGiven = JSON.stringify({
	query: `query lastAuditsGiven { 
			audit(where: {auditor: {id: {_eq: ${currUser.id}}}}, order_by: {id: desc}, limit: 5) { 
				createdAt 
				group { 
					captain { 
						firstName 
						lastName 
						login 
					} 
				} 
			} 
		}`,
	operationName: "lastAuditsGiven"
});

fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
	method: 'POST',
	headers: headers,
	body: basicInfo
})
	.then(response => response.json())
	.then(userdata => {
		if (userdata.errors) {
			console.error('GraphQL Error:', userdata.errors);
		} else {
			currUser = userdata.data.user[0];

			document.title = `${currUser.firstName} ${currUser.lastName}'s Profile`;

			const navbarBrand = document.querySelector('.navbar-brand');
			if (navbarBrand) {
				navbarBrand.textContent = `Hello, ${currUser.firstName} ${currUser.lastName} (${currUser.login})`;
			}

			const navUserID = document.getElementById('nav-user-id');
			if (navUserID) {
				navUserID.textContent = "user #" + currUser.id;
			}
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});

fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
	method: 'POST',
	headers: headers,
	body: lastAuditsGiven
})
	.then(response => response.json())
	.then(auditdata => {
		if (auditdata.errors) {
			console.error('GraphQL Error:', auditdata.errors);
		} else {
			console.log(auditdata);
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