// script.js

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAVp16Nnxsj5EBQmn7hbBbI_kfvTiQNXac",
    authDomain: "blog-ufabc-ddbe4.firebaseapp.com",
    projectId: "blog-ufabc-ddbe4",
    storageBucket: "blog-ufabc-ddbe4.appspot.com",
    messagingSenderId: "865379869123",
    appId: "1:865379869123:web:09c347dee3ea3a154d5d76",
    measurementId: "G-VQNXV3PNZ5"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = firebase.firestore();

// Inicializa o Firebase Storage
const storage = firebase.storage();

let editPostId = null; // Variável para armazenar o ID do post em edição

// Função para buscar todos os posts
function fetchRecentPosts() {
    db.collection('posts')
        .orderBy('timestamp', 'desc')
        // Removido .limit() para buscar todos os posts
        .get()
        .then(querySnapshot => {
            const posts = [];
            querySnapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });
            displayRecentPosts(posts);
        })
        .catch(error => {
            console.error('Erro ao buscar posts:', error);
        });
}

// Função para exibir os posts recentes na página
function displayRecentPosts(posts) {
    const recentPostsSection = document.getElementById('recentPosts');

    recentPostsSection.innerHTML = ''; // Limpa o conteúdo existente

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Monta a estrutura do post
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p id="author">Autor: ${post.author}</p>
            <p>${post.content}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Imagem do post">` : ''}
            <button onclick="deletePost('${post.id}')">Excluir</button>
            <button onclick="editPost('${post.id}')">Editar</button>
        `;

        recentPostsSection.appendChild(postElement);
    });
}

// Função para buscar e exibir todos os autores
function fetchAuthors() {
    db.collection('posts')
        .get()
        .then(querySnapshot => {
            const authorsSet = new Set();
            querySnapshot.forEach(doc => {
                const post = doc.data();
                authorsSet.add(post.author);
            });

            displayAuthors(Array.from(authorsSet));
        })
        .catch(error => {
            console.error('Erro ao buscar autores:', error);
        });
}

// Função para exibir os botões dos autores
function displayAuthors(authors) {
    const authorsList = document.getElementById('authorsList');
    authorsList.innerHTML = ''; // Limpa o conteúdo existente

    authors.forEach(author => {
        const authorButton = document.createElement('button');
        authorButton.textContent = author;
        authorButton.onclick = () => filterPostsByAuthor(author);
        authorsList.appendChild(authorButton);
    });
}

// Função para filtrar posts por autor
function filterPostsByAuthor(author) {
    db.collection('posts')
        .where('author', '==', author)
        .orderBy('timestamp', 'desc')
        .get()
        .then(querySnapshot => {
            const posts = [];
            querySnapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });

            displayPosts(posts);
        })
        .catch(error => {
            console.error('Erro ao buscar posts por autor:', error);
        });
}

// Função para filtrar os posts (por título ou autor)
function filterPosts() {
    let filteredPosts = [];

    // Obtém os valores dos campos de filtro
    const titleFilter = filterTitle.value.toLowerCase();
    const authorFilter = filterAuthor.value.toLowerCase(); // Adicionado filtro por autor
    const dateFilter = filterDate.value;

    db.collection('posts')
        .orderBy('timestamp', 'desc') // Ordena por data de forma decrescente
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const post = doc.data();
                const postTitle = post.title.toLowerCase();
                const postAuthor = post.author.toLowerCase(); // Verifica o autor
                const postDate = post.timestamp.toDate();

                // Verifica se o título e autor do post contêm os filtros aplicados
                if (postTitle.includes(titleFilter) &&
                    postAuthor.includes(authorFilter) &&
                    (!dateFilter || postDate.toISOString().split('T')[0] === dateFilter)) {
                    filteredPosts.push({ id: doc.id, ...doc.data() });
                }
            });

            // Atualiza a lista de posts exibidos com os posts filtrados
            displayPosts(filteredPosts);

            // Se não houver resultados, exibe uma mensagem
            if (filteredPosts.length === 0) {
                showNoResultsMessage();
            } else {
                hideNoResultsMessage();
            }
        })
        .catch(error => {
            console.error('Erro ao filtrar posts:', error);
        });
}


// Função para exibir mensagem de nenhum resultado encontrado
function showNoResultsMessage() {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.textContent = 'Nenhum resultado encontrado.';
    noResultsMessage.id = 'noResultsMessage';

    // Adiciona a mensagem após a seção de posts
    const postList = document.getElementById('postList');
    postList.innerHTML = ''; // Limpa o conteúdo atual
    postList.appendChild(noResultsMessage);
}

// Função para esconder mensagem de nenhum resultado encontrado
function hideNoResultsMessage() {
    const noResultsMessage = document.getElementById('noResultsMessage');
    if (noResultsMessage) {
        noResultsMessage.remove();
    }
}

// Função para exibir posts
function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p id="author">Autor ${post.author}</p>
            <p>${post.content}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Imagem do post">` : ''}
            <button onclick="editPost('${post.id}')">Editar</button>
            <button onclick="deletePost('${post.id}')">Excluir</button>
        `;

        postsContainer.appendChild(postElement);
    });
}

// Função para alternar entre a visualização da seção de criação de posts
function toggleCreatePost() {
    const createPostSection = document.getElementById('createPost');

    if (createPostSection.style.display === 'none') {
        createPostSection.style.display = 'block';
    } else {
        createPostSection.style.display = 'none';
        editPostId = null; // Reseta o ID do post em edição quando o formulário é escondido
        postForm.reset(); // Reseta o formulário
    }
}

// Função para editar um post
function editPost(postId) {
    const confirmEdit = confirm('Tem certeza que deseja editar este post?');

    if (confirmEdit) {
        db.collection('posts').doc(postId).get().then(doc => {
            if (doc.exists) {
                const post = doc.data();
                postTitle.value = post.title;
                postAuthor.value = post.author;
                postContent.value = post.content.replace(/\n/g, '<br>'); // Substitui quebras de linha por <br>
                editPostId = postId; // Armazena o ID do post em edição
                toggleCreatePost(); // Mostra o formulário de criação/edição
            } else {
                console.error('Post não encontrado!');
            }
        }).catch(error => {
            console.error('Erro ao buscar o post:', error);
        });
    }
}


// Função para criar ou atualizar um post
const postForm = document.getElementById('postForm');
postForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página

    const title = postTitle.value;
    const author = postAuthor.value;
    const content = postContent.value.replace(/\n/g, '<br>'); // Substitui quebras de linha por <br>
    const imageFile = document.getElementById('postImage').files[0];

    // Função para salvar o post no Firestore
    function savePost(imageUrl) {
        const postData = {
            title: title,
            author: author,
            content: content,
            imageUrl: imageUrl || '',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (editPostId) {
            // Atualiza o post existente
            db.collection('posts').doc(editPostId).update(postData).then(() => {
                console.log('Post atualizado com sucesso!');
                editPostId = null; // Reseta o ID do post em edição
                postForm.reset(); // Limpa o formulário após a submissão
                toggleCreatePost(); // Oculta a seção de criação de posts após a criação
                fetchRecentPosts(); // Atualiza os posts recentes após a criação de um novo post
                alert('Post atualizado com sucesso!'); // Alerta de sucesso
            }).catch(error => {
                console.error('Erro ao atualizar o post: ', error);
            });
        } else {
            // Cria um novo post
            db.collection('posts').add(postData).then((docRef) => {
                console.log('Post adicionado com sucesso! Document ID:', docRef.id);
                postForm.reset(); // Limpa o formulário após a submissão
                toggleCreatePost(); // Oculta a seção de criação de posts após a criação
                fetchRecentPosts(); // Atualiza os posts recentes após a criação de um novo post
                alert('Post adicionado com sucesso!'); // Alerta de sucesso
            }).catch(error => {
                console.error('Erro ao adicionar o post: ', error);
            });
        }
    }

    if (imageFile) {
        const storageRef = storage.ref();
        const imageRef = storageRef.child('images/' + imageFile.name);

        imageRef.put(imageFile).then((snapshot) => {
            snapshot.ref.getDownloadURL().then((downloadURL) => {
                savePost(downloadURL);
            });
        }).catch(error => {
            console.error('Erro ao fazer upload da imagem: ', error);
        });
    } else {
        savePost();
    }
});

// Função para excluir um post
function deletePost(postId) {
    const confirmDelete = confirm('Tem certeza que deseja excluir este post?');

    if (confirmDelete) {
        db.collection('posts').doc(postId).delete()
        .then(() => {
            console.log('Post excluído com sucesso!');
            fetchRecentPosts(); // Atualiza os posts recentes após a exclusão de um post
            alert('Post excluído com sucesso!'); // Alerta de sucesso
        })
        .catch(error => {
            console.error('Erro ao excluir o post: ', error);
        });
    }
}


// Chamada inicial para exibir os posts recentes ao carregar a página
fetchAuthors();
fetchRecentPosts();

