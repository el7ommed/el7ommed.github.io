console.log("index.js loaded!");

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('floatingInput').value;
        const password = document.getElementById('floatingPassword').value;

        await login(email, password);
    });
});

async function login(email, password) {
    const credentials = email + ':' + password;
    const encodedCredentials = btoa(credentials);

    const headers = {
        'Authorization': 'Basic ' + encodedCredentials,
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch('https://learn.reboot01.com/api/auth/signin', {
            method: 'POST',
            headers: headers
        });

        if (response.ok) {
            const jwt = await response.text();
            localStorage.setItem('jwt', jwt);
            window.location.href = 'profile.html';
        } else {
            alert('Login failed: Invalid email or password.');
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
}

// let queryBasicUserDetails = `
// query userBasic {
//     user {
//         firstName
//         lastName
//         login
//         campus
//         createdAt
//     }
// }
// `

// let queryAuditDetails = `
// query auditOverview {
//     audit(offset: 0, limit: 1) {
//         attrs
//         auditedAt
//         auditorId
//         createdAt
//         endAt
//         grade
//         groupId
//         id
//         resultId
//         updatedAt
//         version
//     }
// }
// `

// let queryGroupDetails = `
// query groupList {
//     group(offset: 0, limit: 1) {
//         campus
//         captainId
//         createdAt
//         eventId
//         id
//         objectId
//         path
//         status
//         updatedAt
//     }
// }
// `