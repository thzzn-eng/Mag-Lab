document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout');
    const addBlogButton = document.getElementById('addBlog');
    const uploadPhotoButton = document.getElementById('uploadPhoto');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminPasswordInput = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const manageBlogsSection = document.getElementById('manageBlogs');
    const managePhotographySection = document.getElementById('managePhotography');
    const blogList = document.getElementById('blogList');
    const photoGallery = document.getElementById('photoGallery');

    const ADMIN_PASSWORD = 'securepassword'; // Replace with a hashed password for better security

    adminLoginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const enteredPassword = adminPasswordInput.value;
        if (enteredPassword === ADMIN_PASSWORD) {
            loginError.style.display = 'none';
            adminLoginForm.style.display = 'none';
            manageBlogsSection.style.display = 'block';
            managePhotographySection.style.display = 'block';
        } else {
            loginError.style.display = 'block';
        }
    });

    // Removed token verification logic as it is no longer needed

    // Logout functionality
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Add Blog functionality
    addBlogButton.addEventListener('click', () => {
        const blogTitle = prompt('Enter blog title:');
        const blogContent = prompt('Enter blog content:');

        if (blogTitle && blogContent) {
            const blogEntry = { title: blogTitle, content: blogContent };
            const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
            blogs.push(blogEntry);
            localStorage.setItem('blogs', JSON.stringify(blogs));

            const blogElement = document.createElement('div');
            blogElement.classList.add('blog-entry');
            blogElement.innerHTML = `
                <h3>${blogTitle}</h3>
                <p>${blogContent}</p>
            `;
            blogList.appendChild(blogElement);
        } else {
            alert('Blog title and content are required!');
        }
    });

    // Upload Photo functionality
    uploadPhotoButton.addEventListener('click', () => {
        const photoTitle = prompt('Enter photo title:');
        const photoUrl = prompt('Enter photo URL:');

        if (photoTitle && photoUrl) {
            const photoEntry = { title: photoTitle, url: photoUrl };
            const photos = JSON.parse(localStorage.getItem('photos')) || [];
            photos.push(photoEntry);
            localStorage.setItem('photos', JSON.stringify(photos));

            const photoElement = document.createElement('div');
            photoElement.classList.add('photo-entry');
            photoElement.innerHTML = `
                <h3>${photoTitle}</h3>
                <img src="${photoUrl}" alt="${photoTitle}">
            `;
            photoGallery.appendChild(photoElement);
        } else {
            alert('Photo title and URL are required!');
        }
    });

    // Fetch and display blogs and photos (placeholder logic)
    blogList.innerHTML = '<p>Loading blogs...</p>';
    photoGallery.innerHTML = '<p>Loading photos...</p>';

    // Fetch blogs and photos from the backend (to be implemented)
});
