document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('post-form')) {
        document.getElementById('post-form').addEventListener('submit', function(event) {
            event.preventDefault();

            let title = document.getElementById('title').value;
            let author = document.getElementById('author').value;
            let content = document.getElementById('content').value;
            let imageFile = document.getElementById('image').files[0];
            let timestamp = new Date().toISOString();

            let post = {
                title: title,
                author: author,
                content: content,
                timestamp: timestamp,
                image: ''
            };

            if (imageFile) {
                let reader = new FileReader();
                reader.onload = function(e) {
                    post.image = e.target.result;
                    savePost(post);
                };
                reader.readAsDataURL(imageFile);
            } else {
                savePost(post);
            }
        });
    }
    loadPosts();
});

function savePost(post) {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));

    // Exibir aviso de que o post foi publicado
    alert('Post publicado com sucesso!');

    window.location.href = 'index.html';
}

function loadPosts() {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let postSection = document.getElementById('posts');

    postSection.innerHTML = '';

    // Adicionando o título "Posts Publicados"
    let postsTitle = document.createElement('h2');
    postsTitle.textContent = 'Posts Publicados';
    postSection.appendChild(postsTitle);

    posts.forEach(post => {
        let postDiv = document.createElement('div');
        postDiv.classList.add('post');

        let postTitle = document.createElement('h3');
        postTitle.textContent = post.title;
        postDiv.appendChild(postTitle);

        let postAuthor = document.createElement('p');
        postAuthor.textContent = 'Autor: ' + post.author;
        postDiv.appendChild(postAuthor);

        let postDate = document.createElement('p');
        postDate.textContent = 'Data: ' + new Date(post.timestamp).toLocaleString();
        postDiv.appendChild(postDate);

        let postContent = document.createElement('p');
        postContent.textContent = post.content;
        postDiv.appendChild(postContent);

        if (post.image) {
            let postImage = document.createElement('img');
            postImage.src = post.image;
            postImage.alt = post.title; // Adicionando um atributo alt para acessibilidade
            postDiv.appendChild(postImage);
        }

        let postButtons = document.createElement('div');
        postButtons.classList.add('post-buttons');

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.onclick = function() {
            postDiv.remove();
            deletePost(post.timestamp);
        };
        postButtons.appendChild(deleteButton);

        postDiv.appendChild(postButtons);
        postSection.appendChild(postDiv);
    });
}

function deletePost(timestamp) {
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts = posts.filter(p => p.timestamp !== timestamp);
    localStorage.setItem('posts', JSON.stringify(posts));
}

function filterPosts() {
    let filterTitle = document.getElementById('filter-title').value.toLowerCase();
    let filterDate = document.getElementById('filter-date').value;

    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let postSection = document.getElementById('posts');

    postSection.innerHTML = '';

    let filteredPosts = posts.filter(post => {
        let postTitle = post.title.toLowerCase();
        let postDate = post.timestamp.split('T')[0];

        return (!filterTitle || postTitle.includes(filterTitle)) &&
               (!filterDate || postDate === filterDate);
    });

    // Adicionando o título "Posts Publicados"
    let postsTitle = document.createElement('h2');
    postsTitle.textContent = 'Posts Publicados';
    postSection.appendChild(postsTitle);

    filteredPosts.forEach(post => {
        let postDiv = document.createElement('div');
        postDiv.classList.add('post');

        let postTitle = document.createElement('h3');
        postTitle.textContent = post.title;
        postDiv.appendChild(postTitle);

        let postAuthor = document.createElement('p');
        postAuthor.textContent = 'Autor: ' + post.author;
        postDiv.appendChild(postAuthor);

        let postDate = document.createElement('p');
        postDate.textContent = 'Data: ' + new Date(post.timestamp).toLocaleString();
        postDiv.appendChild(postDate);

        let postContent = document.createElement('p');
        postContent.textContent = post.content;
        postDiv.appendChild(postContent);

        if (post.image) {
            let postImage = document.createElement('img');
            postImage.src = post.image;
            postImage.alt = post.title; // Adicionando um atributo alt para acessibilidade
            postDiv.appendChild(postImage);
        }

        let postButtons = document.createElement('div');
        postButtons.classList.add('post-buttons');

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Excluir';
        deleteButton.onclick = function() {
            postDiv.remove();
            deletePost(post.timestamp);
        };
        postButtons.appendChild(deleteButton);

        postDiv.appendChild(postButtons);
        postSection.appendChild(postDiv);
    });
}
