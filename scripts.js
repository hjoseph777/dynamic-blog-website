// Get posts from storage
function getPosts() {
    var posts = localStorage.getItem('posts');
    if (posts) {
        return JSON.parse(posts);
    } else {
        return [];
    }
}


function savePosts(posts) {
    localStorage.setItem('posts', JSON.stringify(posts));
}

// Get URL Parameters
function getQueryParam(param) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}


document.addEventListener('DOMContentLoaded', function () {
    var currentPage = document.body.getAttribute('data-page');

    if (currentPage === 'index') {
        displayPosts();
        initializeProjectGallery();
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

function initializeProjectGallery() {
    document.querySelectorAll('.show-details').forEach(function (button) {
        button.addEventListener('click', function () {
            var projectId = this.getAttribute('data-project');
            var details = document.getElementById('details' + projectId);
            if (details.style.display === 'none') {
                details.style.display = 'block';
                this.textContent = 'Hide Details';
            } else {
                details.style.display = 'none';
                this.textContent = 'Show Details';
            }
        });
    });
}
















function displayPosts() {
    var posts = getPosts();
    var postsContainer = document.getElementById('posts-container');

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

    document.querySelectorAll('.delete-post').forEach(function (button) {
        button.addEventListener('click', function () {
            var postId = this.getAttribute('data-id');
            console.log('Delete button clicked for post ID:', postId); // Debugging line
            deletePost(postId);
        });
    });

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-post').forEach(function (button) {
        button.addEventListener('click', function () {
            var postId = this.getAttribute('data-id');
            window.location.href = `edit-post.html?id=${postId}`;
        });
    });
}

// NEW POST PAGE FUNCTIONS
function initializeNewPost() {
    var form = document.getElementById('new-post-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var title = document.getElementById('post-title').value.trim();
        var content = document.getElementById('post-content').value.trim();

        if (title && content) {
            var posts = getPosts();

            // Create a new post object
            var newPost = {
                id: Date.now(),
                title: title,
                content: content
            };

            // Add and save the new post
            posts.push(newPost);
            savePosts(posts);

            // Go to homepage
            window.location.href = 'index.html';
        } else {
            alert('Please fill in both the title and content.');
        }
    });
}

// VIEW POST PAGE FUNCTIONS
function displayPost() {
    var postId = getQueryParam('id');
    var posts = getPosts();
    var post = posts.find(function (p) {
        return p.id == postId;
    });

    if (!post) {
        document.getElementById('post').innerHTML = '<p>Post not found.</p>';
        document.getElementById('post-actions').style.display = 'none';
        return;
    }

    document.getElementById('post').innerHTML = `
        <h2>${post.title}</h2>
        <p>${post.content}</p>
    `;
}

function initializeViewPost() {
    document.getElementById('delete-post').addEventListener('click', function () {
        var postId = getQueryParam('id');
        deletePost(postId);
    });
    document.getElementById('edit-post').addEventListener('click', function () {
        var postId = getQueryParam('id');
        window.location.href = `edit-post.html?id=${postId}`;
    });
}

// DELETE POST FUNCTION - Fixed version
function deletePost(postId) {
    console.log('deletePost function called for post ID:', postId); // Debugging line
    var posts = getPosts();

    // Confirm deletion
    if (confirm('Are you sure you want to delete this post?')) {
        // Remove post from array
        posts = posts.filter(function (p) {
            return p.id != postId;
        });
        
        // Save updated posts
        savePosts(posts);

       
        var currentPage = document.body.getAttribute('data-page');
        
        // Handle redirect based on current page
        if (currentPage === 'index') {
            // If on index page, refresh the posts list
            displayPosts();
        } else {
            // If on view-post page, go back to homepage
            window.location.href = 'index.html';
        }
    }
}

// EDIT POST PAGE FUNCTIONS
function loadPostData() {
    var postId = getQueryParam('id');
    var posts = getPosts();
    var post = posts.find(function (p) {
        return p.id == postId;
    });

    if (!post) {
        alert('Post not found.');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;
}

function initializeEditPost() {
    var form = document.getElementById('edit-post-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var postId = getQueryParam('id');
        var posts = getPosts();
        var postIndex = posts.findIndex(function (p) {
            return p.id == postId;
        });

        if (postIndex === -1) {
            alert('Post not found.');
            window.location.href = 'index.html';
            return;
        }

        var updatedTitle = document.getElementById('post-title').value.trim();
        var updatedContent = document.getElementById('post-content').value.trim();

        if (updatedTitle && updatedContent) {
            // Update the post
            posts[postIndex].title = updatedTitle;
            posts[postIndex].content = updatedContent;

            // Save and redirect
            savePosts(posts);
            window.location.href = `view-post.html?id=${postId}`;
        } else {
            alert('Please fill in both the title and content.');
        }
    });
}
