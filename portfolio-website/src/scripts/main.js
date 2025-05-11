document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed'); // Debugging log

    const projectsContainer = document.getElementById('projects-container');
    const photographyContainer = document.getElementById('photography-container');

    // Updated projects data with summaries and links
    const projects = [
        {
            title: 'Project 1',
            description: 'A 2D simulation of an accretion disk around a black hole, featuring temperature gradients and particle motion.',
            link: 'projects/project1.html'
        },
        {
            title: 'Project 2',
            description: 'A placeholder for another project. Details coming soon!',
            link: '#'
        }
    ];

    // Sample photography data
    const photography = [
        {
            title: 'Photo 1',
            imageUrl: 'images/photo1.jpg'
        },
        {
            title: 'Photo 2',
            imageUrl: 'images/photo2.jpg'
        }
    ];

    // Function to display projects
    function displayProjects() {
        projects.forEach(project => {
            const projectElement = document.createElement('div');
            projectElement.classList.add('project');
            projectElement.innerHTML = `
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <a href="${project.link}">View Project</a>
            `;
            projectsContainer.appendChild(projectElement);
        });
    }

    // Function to display photography
    function displayPhotography() {
        photography.forEach(photo => {
            const photoElement = document.createElement('div');
            photoElement.classList.add('photo');
            photoElement.innerHTML = `
                <h3>${photo.title}</h3>
                <img src="${photo.imageUrl}" alt="${photo.title}">
            `;
            photographyContainer.appendChild(photoElement);
        });
    }

    // Only display projects if the container exists (to avoid errors on other pages)
    if (projectsContainer) {
        displayProjects();
    }
    displayPhotography();

    // Ensure the login form exists before adding the event listener
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Login form submitted'); // Debugging log

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log('Email:', email); // Debugging log
        console.log('Password:', password); // Debugging log

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            console.log('Response status:', response.status); // Debugging log

            if (response.ok) {
                const data = await response.json();
                console.log('Login successful, token:', data.token); // Debugging log
                localStorage.setItem('token', data.token);
                window.location.href = 'admin.html';
            } else {
                const errorData = await response.json();
                console.error('Login failed:', errorData); // Debugging log
                document.getElementById('loginError').textContent = errorData.message || 'Login failed';
                document.getElementById('loginError').style.display = 'block';
            }
        } catch (error) {
            console.error('Error logging in:', error);
            document.getElementById('loginError').textContent = 'An error occurred. Please try again later.';
            document.getElementById('loginError').style.display = 'block';
        }
    });
});