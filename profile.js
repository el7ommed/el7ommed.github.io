console.log("profile.js loaded!");

const jwt = localStorage.getItem('jwt');

const headers = {
	'Authorization': 'Bearer ' + jwt,
	'Content-Type': 'text/plain;charset=UTF-8',
	'Accept': '*/*',
	'Cache-Control': 'no-cache',
	'Pragma': 'no-cache',
};

const query = `{
	"query": "query basicInfo{\nuser{\n id\n firstName\n lastName\n}\n}",
	"operationName": "basicInfo"
}`;

fetch('https://learn.reboot01.com/api/graphql-engine/v1/graphql', {
	method: 'POST',
	headers: headers,
	body: query
})
	.then(response => response.json())
	.then(data => {
		if (data.errors) {
			console.error('GraphQL Error:', data.errors);
		} else {
			const user = data.data.user;
			console.log('User Data:', user);
		}
	})
	.catch(error => {
		console.error('Error:', error);
	});