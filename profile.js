console.log("profile.js loaded!");

import { jwt } from './redirect.js';

let currUser = {
	id: 0,
	login: '',
	firstName: '',
	lastName: '',
};

const headers = {
	'Authorization': 'Bearer ' + jwt,
	'Content-Type': 'application/json',
	'Accept': '*/*',
	'Cache-Control': 'no-cache',
	'Pragma': 'no-cache',
};

async function fetchBasicInfo() {
	const basicInfo = JSON.stringify({
		query:
		`query basicInfo {
			user {
				id
				login
				firstName
				lastName
			}
		}`,
		operationName: "basicInfo"
	});

	const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
		method: 'POST',
		headers: headers,
		body: basicInfo,
	});
	const data = await response.json();

	if (data.errors) {
		throw new Error(`GraphQL Error: ${data.errors}`);
	}

	currUser = data.data.user[0];
	updatePage(currUser);
}

function updatePage(user) {
	document.title = `${user.firstName} ${user.lastName}'s Profile`;

	const navbarBrand = document.querySelector('.navbar-brand');
	if (navbarBrand) {
		navbarBrand.textContent = `Hello, ${user.firstName} ${user.lastName} (${user.login})`;
	}

	const navUserID = document.getElementById('nav-user-id');
	if (navUserID) {
		navUserID.textContent = 'user #' + user.id;
	}
}

async function fetchLastAudits() {
	const lastAuditsGiven = JSON.stringify({
		query:
		`query lastAuditsGiven {
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
		operationName: "lastAuditsGiven",
	});

	const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
		method: 'POST',
		headers: headers,
		body: lastAuditsGiven,
	});
	const data = await response.json();

	if (data.errors) {
		throw new Error(`GraphQL Error: ${data.errors}`);
	}
}

async function fetchTopProjects() {
	const topProjects = JSON.stringify({
		query:
		`query topProjects {
			xp_view(limit: 5, order_by: {amount: desc}) {
				amount
				path
			}
		}`,
		operationName: "topProjects"
	});

	const response = await fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
		method: 'POST',
		headers: headers,
		body: topProjects,
	});
	const data = await response.json();

	if (data.errors) {
		throw new Error(`GraphQL Error: ${data.errors}`);
	}
}

(async () => {
	try {
		await fetchBasicInfo();
		await fetchLastAudits();
		await fetchTopProjects();
		// await function();
	} catch (error) {
		console.error(error.message);
	}
})();

const logoutButton = document.getElementById('Logout');
if (logoutButton) {
	logoutButton.addEventListener('click', () => {
		localStorage.removeItem('jwt');
		window.location.href = 'index.html';
	});
}