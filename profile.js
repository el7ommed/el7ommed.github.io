console.log("profile.js loaded!");

import { jwt } from "./redirect.js";

let currUser = {
	id: 0,
	login: "",
	firstName: "",
	lastName: "",
};

const headers = {
	"Authorization": "Bearer " + jwt,
	"Content-Type": "application/json",
	"Accept": "*/*",
	"Cache-Control": "no-cache",
	"Pragma": "no-cache",
};

async function fetchGraphQL(query, operationName) {
	const body = JSON.stringify({ query, operationName });
	const response = await fetch("https://learn.reboot01.com/api/graphql-engine/v1/graphql", {
		method: "POST",
		headers: headers,
		body: body,
	});
	const data = await response.json();
	if (data.errors) {
		throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
	}
	return data.data;
}

async function fetchBasicInfo() {
	const query =
		`query basicInfo {
			user {
				id
				login
				firstName
				lastName
			}
		}`;
	const data = await fetchGraphQL(query, "basicInfo");
	currUser = data.user[0];
	updatePage(currUser);
}

function updatePage(user) {
	document.title = `${user.firstName} ${user.lastName}'s Profile`;

	const navbarBrand = document.querySelector(".navbar-brand");
	if (navbarBrand) {
		navbarBrand.textContent = `Hello, ${user.firstName} ${user.lastName} (${user.login})`;
	}

	const navUserID = document.getElementById("nav-user-id");
	if (navUserID) {
		navUserID.textContent = "user #" + user.id;
	}
}

async function fetchLastAudits() {
	if (currUser.id === 0) {
		console.error("User ID is not set yet!");
		return;
	}

	const query =
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
		}`;
	const data = await fetchGraphQL(query, "lastAuditsGiven");
	// console.log("Last Audits:", data.audit);
}

async function fetchTopProjects() {
	const query =
		`query topProjects {
			xp_view(limit: 5, order_by: {amount: desc}) {
				amount
				path
			}
		}`;
	const data = await fetchGraphQL(query, "topProjects");
	// console.log("Top Projects:", data.xp_view);
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

const logoutButton = document.getElementById("Logout");
if (logoutButton) {
	logoutButton.addEventListener("click", () => {
		localStorage.removeItem("jwt");
		window.location.href = "index.html";
	});
}