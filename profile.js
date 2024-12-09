console.log("profile.js loaded!");

import { jwt } from "./redirect.js";

const GRAPHQL_ENDPOINT = "https://learn.reboot01.com/api/graphql-engine/v1/graphql"

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

function formatTimestamp(timestamp) {
	const date = new Date(timestamp);
	return date.toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function formatBytes(bytes) {
	const units = ["Bytes", "KB", "MB"];
	let unitIndex = 0;

	while (bytes >= 1000 && unitIndex < units.length - 1) {
		bytes /= 1000;
		unitIndex++;
	}

	return `${bytes} ${units[unitIndex]}`;
}

async function fetchGraphQL(query, operationName) {
	const body = JSON.stringify({ query, operationName });
	const response = await fetch(GRAPHQL_ENDPOINT, {
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
				auditedAt
				group {
					path
					captain {
						id
						firstName
						lastName
						login
					}
				}
				private{
					code
				}
			}
		}`;
	const data = await fetchGraphQL(query, "lastAuditsGiven");
	populateAudits(data.audit);
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
	populateProjects(data.xp_view)
	// console.log("Top Projects:", data.xp_view);
}

async function fetchTopSkills() {
	const query =
		`query highestSkills {
			user {
				transactions(
				where: {type: {_like: "skill_%"}}
				distinct_on: type
				order_by: [{type: asc}, {amount: desc}]
				) {
					type
					amount
				}
			}
		}`
	const data = await fetchGraphQL(query, "highestSkills");
	const topSkills = data.user[0].transactions
		.sort((a, b) => b.amount - a.amount)
		.slice(0, 5);
	populateSkills(topSkills);
	// console.log("Top Skills:", data.user[0].transactions);
}

async function fetchAuditRatio() {
	const query =
		`query totalRatio{
			user{
				totalUp
				totalDown
			}
		}`;
	const data = await fetchGraphQL(query, "totalRatio");
	// console.log("Audit Ratio:", data.user[0]);
}

(async () => {
	try {
		await fetchBasicInfo();
		await fetchLastAudits();
		await fetchTopProjects();
		await fetchTopSkills();
		await fetchAuditRatio();
	} catch (error) {
		console.error(error.message);
	}
})();

const auditsContainer = document.getElementById("audits-container");
function populateAudits(audits) {
	auditsContainer.innerHTML = "";
	audits.forEach((audit) => {
		const card = document.createElement("div");
		card.className = "col";
		card.innerHTML =
			`<div class="card">
			<div class="card-header">
				Audit with ${audit.group.captain.firstName} ${audit.group.captain.lastName} (${audit.group.captain.login})
			</div>
			<div class="card-body d-flex justify-content-between align-items-center">
			<h5 class="card-title mb-0">${audit.group.path.split('/').pop()}</h5>
			<a class="btn btn-primary btn-sm ms-3">Code: ${audit.private.code}</a>
			</div>
			<div class="card-footer text-muted">${formatTimestamp(audit.createdAt)}</div>
			</div>`;
		auditsContainer.appendChild(card);
	});
}

const projectsContainer = document.getElementById("projects-container");
function populateProjects(projects) {
	projectsContainer.innerHTML = "";
	projects.forEach((project) => {
		const card = document.createElement("div");
		card.className = "col";
		card.innerHTML =
			`<div class="card">
				<div class="card-header">Project</div>
				<div class="card-body">
					<h5 class="card-title">${project.path.split('/').pop()}</h5>
					<p class="card-text">Earned XP: ${formatBytes(project.amount)}</p>
				</div>
				<!-- <div class="card-footer text-muted">Description</div> -->
			</div>`;
		projectsContainer.appendChild(card);
	});
}

const skillsContainer = document.getElementById("skills-container");
function populateSkills(transactions) {
	skillsContainer.innerHTML = "";
	transactions.forEach((transaction) => {
		const card = document.createElement("div");
		card.className = "col";
		card.innerHTML =
			`<div class="card">
				<div class="card-header">${transaction.type.split('_').pop()}</div>
				<div class="card-body">
					<h5 class="card-title">${transaction.amount}%</h5>
				</div>
			</div>`;
		skillsContainer.appendChild(card);
	});
}

const logoutButton = document.getElementById("Logout");
if (logoutButton) {
	logoutButton.addEventListener("click", () => {
		localStorage.removeItem("jwt");
		window.location.href = "index.html";
	});
}