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
	populateSkills(topSkills.slice(0, 5));
	renderSpiderChart(topSkills.slice(0, 6));
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
	renderPieChart(data.user[0]);
	// console.log("Audit Ratio:", data.user[0]);
}

const totalAuditsTitle = document.getElementById("total-audits-title");
function renderPieChart({ totalUp, totalDown }) {
	totalAuditsTitle.textContent = `Audits Done: ${formatBytes(totalUp)} | Audits Received: ${formatBytes(totalDown)}`;

	const data = [
		{ label: "Audits Done", value: totalUp },
		{ label: "Audits Received", value: totalDown },
	];

	const
		width = 300,
		height = 300,
		radius = Math.min(width, height) / 2;

	const svg = d3.select("#pie-chart")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", `translate(${width / 2}, ${height / 2})`);

	const color = d3.scaleOrdinal(["#0061F5", "#DA2E40"]);

	const pie = d3.pie().value(d => d.value);
	const arc = d3.arc().innerRadius(0).outerRadius(radius);

	svg.selectAll("path")
		.data(pie(data))
		.enter()
		.append("path")
		.attr("d", arc)
		.attr("fill", d => color(d.data.label))
		.attr("stroke", "white")
		.style("stroke-width", "5px");

	svg.selectAll("text")
		.data(pie(data))
		.enter()
		.append("text")
		.style("fill", "white")
		.style("font-size", "14px")
		.attr("transform", d => `translate(${arc.centroid(d)})`)
		.style("text-anchor", "middle")
		.text(d => d.data.label);
}

function renderSpiderChart(skills) {
	const data = skills.map((skill, i) => ({
		axis: skill.type.split("_").pop(),
		value: skill.amount,
		index: i
	}));

	const
		width = 300,
		height = 300,
		radius = Math.min(width, height) / 2,
		levels = 5;

	const svg = d3.select("#spider-chart")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", `translate(${width / 2}, ${height / 2})`);

	const angleScale = d3.scaleLinear()
		.domain([0, data.length])
		.range([0, 2 * Math.PI]);

	const radiusScale = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.value)])
		.range([0, radius]);

	for (let i = 1; i <= levels; i++) {
		const levelRadius = (radius / levels) * i;
		svg.append("circle")
			.attr("cx", 0)
			.attr("cy", 0)
			.attr("r", levelRadius)
			.attr("fill", "none")
			.attr("stroke", "lightgray")
			.attr("stroke-width", 0.5);
	}

	data.forEach((d, i) => {
		const angle = angleScale(i) - Math.PI / 2;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;

		svg.append("line")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", x)
			.attr("y2", y)
			.attr("stroke", "gray")
			.attr("stroke-width", 0.5);

		const labelOffset = 15;
		const labelX = Math.cos(angle) * (radius + labelOffset);
		const labelY = Math.sin(angle) * (radius + labelOffset);

		svg.append("text")
			.attr("x", labelX)
			.attr("y", labelY)
			.attr("text-anchor", "middle")
			.style("font-size", "12px")
			.text(d.axis);
	});

	const line = d3.line()
		.x(d => {
			const angle = angleScale(d.index) - Math.PI / 2;
			return Math.cos(angle) * radiusScale(d.value);
		})
		.y(d => {
			const angle = angleScale(d.index) - Math.PI / 2;
			return Math.sin(angle) * radiusScale(d.value);
		})
		.curve(d3.curveLinearClosed);

	svg.append("path")
		.datum(data)
		.attr("d", line)
		.attr("fill", "blue")
		.attr("fill-opacity", 0.1)
		// .attr("stroke", "blue")
		// .attr("stroke-width", 1);

	data.forEach((d, i) => {
		const angle = angleScale(i) - Math.PI / 2;
		const x = Math.cos(angle) * radiusScale(d.value);
		const y = Math.sin(angle) * radiusScale(d.value);

		svg.append("circle")
			.attr("cx", x)
			.attr("cy", y)
			.attr("r", 4)
			.attr("fill", "blue")
			.attr("stroke", "white")
			.attr("stroke-width", 1.5);
	});
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