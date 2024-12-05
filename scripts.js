document.addEventListener('DOMContentLoaded', function () {
    var currentPage = document.body.getAttribute('data-page');

    if (currentPage === 'index') {
        displayPosts();
        initializeProjectGallery();
        initMap();
    } else if (currentPage === 'new-post') {
        initializeNewPost();
    } else if (currentPage === 'view-post') {
        displayPost();
        initializeViewPost();
    } else if (currentPage === 'edit-post') {
        loadPostData();
        initializeEditPost();
    }
});

function initializeNewPost() {
    const form = document.getElementById('newPostForm');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        savePost(title, content);
    });
}

function savePost(title, content) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const newPost = { title, content, id: Date.now() };
    posts.push(newPost);
    localStorage.setItem('posts', JSON.stringify(posts));
    alert('Post saved successfully!');
    window.location.href = 'index.html';
}

function displayPosts() {
    const postsContainer = document.getElementById('posts-container');
    const posts = JSON.parse(localStorage.getItem('posts')) || [];

    if (!postsContainer) return;

    if (posts.length === 0) {
        postsContainer.innerHTML = '<p>No blog posts available. Create a new post!</p>';
        return;
    }

    postsContainer.innerHTML = ''; // Clear container

    posts.forEach(function (post) {
        var postElement = document.createElement('div');
        postElement.classList.add('post');

        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content.substring(0, 200)}...</p>
            <a href="view-post.html?id=${post.id}">Read More</a>
            <button class="edit-post" data-id="${post.id}">Edit</button>
            <button class="delete-post" data-id="${post.id}">Delete</button>
        `;

        postsContainer.appendChild(postElement);
    });

    // Add delete and edit button event listeners
    document.querySelectorAll('.delete-post').forEach(function (button) {
        button.addEventListener('click', function () {
            var postId = this.getAttribute('data-id');
            deletePost(postId);
        });
    });

    document.querySelectorAll('.edit-post').forEach(function (button) {
        button.addEventListener('click', function () {
            var postId = this.getAttribute('data-id');
            window.location.href = `edit-post.html?id=${postId}`;
        });
    });
}

function deletePost(postId) {
    var posts = getPosts();

    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(function (p) {
            return p.id != postId;
        });
        
        savePosts(posts);
        displayPosts(); // Refresh the posts list
    }
}

function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}

function savePosts(posts) {
    localStorage.setItem('posts', JSON.stringify(posts));
}

function displayPost() {
    const postId = new URLSearchParams(window.location.search).get('id');
    
    if (!postId) {
        handleNoPost('No Post Selected', 'Please select a valid post.');
        return;
    }

    const posts = getPosts();
    const post = posts.find(p => p.id == postId);
    
    const elements = {
        title: document.getElementById('post-title'),
        content: document.getElementById('post-content'),
        editBtn: document.getElementById('edit-post'),
        deleteBtn: document.getElementById('delete-post'),
        actions: document.getElementById('post-actions')
    };

    if (!elements.title || !elements.content) return; // Guard clause for missing elements

    if (post) {
        displayPostContent(post, elements);
        setupPostActions(postId, elements);
    } else {
        handleNoPost('Post Not Found', 'The post you are looking for does not exist.');
    }
}

function displayPostContent(post, elements) {
    elements.title.textContent = post.title;
    elements.content.textContent = post.content;
    elements.actions.style.display = 'flex';
}

function setupPostActions(postId, elements) {
    if (elements.editBtn) {
        elements.editBtn.onclick = () => window.location.href = `edit-post.html?id=${postId}`;
    }
    
    if (elements.deleteBtn) {
        elements.deleteBtn.onclick = () => {
            if (confirm('Are you sure you want to delete this post?')) {
                deletePost(postId);
                window.location.href = 'index.html';
            }
        }
    }
}

function handleNoPost(title, message) {
    const elements = {
        title: document.getElementById('post-title'),
        content: document.getElementById('post-content'),
        actions: document.getElementById('post-actions')
    };

    if (elements.title) elements.title.textContent = title;
    if (elements.content) elements.content.textContent = message;
    if (elements.actions) elements.actions.style.display = 'none';
}

function initializeViewPost() {
    // Additional logic for viewing a post can be added here
}

function loadPostData() {
    const postId = new URLSearchParams(window.location.search).get('id');
    const posts = getPosts();
    const post = posts.find(p => p.id == postId);

    if (post) {
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-content').value = post.content;
    }
}

function initializeEditPost() {
    const form = document.getElementById('edit-post-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const postId = new URLSearchParams(window.location.search).get('id');
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        updatePost(postId, title, content);
    });
}

function updatePost(postId, title, content) {
    var posts = getPosts();
    var postIndex = posts.findIndex(p => p.id == postId);

    if (postIndex > -1) {
        posts[postIndex].title = title;
        posts[postIndex].content = content;
        savePosts(posts);
        alert('Post updated successfully!');
        window.location.href = 'index.html';
    } else {
        alert('Post not found');
    }
}

function initMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            handleLocationSuccess,
            handleLocationError,
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        displayErrorMessage("Geolocation is not supported by this browser.");
    }
}

function handleLocationSuccess(position) {
    const { latitude, longitude } = position.coords;
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapId: 'DEMO_MAP_ID'
    });

    marker = new google.maps.marker.AdvancedMarkerView({
        map: map,
        position: { lat: latitude, lng: longitude },
        title: 'Your Current Location'
    });

    updateLocationDetails(latitude, longitude);
    performReverseGeocoding(latitude, longitude);
}

function handleLocationError(error) {
    displayErrorMessage(`Geolocation error: ${error.message}`);
}

function displayErrorMessage(message) {
    const coordinatesElement = document.getElementById('coordinates');
    coordinatesElement.textContent = message;
}

function updateLocationDetails(latitude, longitude) {
    const coordinatesElement = document.getElementById('coordinates');
    coordinatesElement.textContent = `Latitude: ${latitude}, Longitude: ${longitude}`;
}

function performReverseGeocoding(latitude, longitude) {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat: latitude, lng: longitude };

    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK") {
            if (results[0]) {
                const address = results[0].formatted_address;
                document.getElementById('address').textContent = `Address: ${address}`;
            } else {
                document.getElementById('address').textContent = 'No results found';
            }
        } else {
            document.getElementById('address').textContent = 'Geocoder failed due to: ' + status;
        }
    });
}

function initializeProjectGallery() {
    document.querySelectorAll('.show-details').forEach(function (button) {
        button.addEventListener('click', function () {
            const projectId = this.getAttribute('data-project');
            const detailsElement = document.getElementById(`details${projectId}`);
            detailsElement.style.display = detailsElement.style.display === 'none' ? 'block' : 'none';
        });
    });
}