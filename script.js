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

// Função para buscar os posts mais recentes
function fetchRecentPosts() {
    db.collection('posts')
        .orderBy('timestamp', 'desc')
        .limit(5) // Limita a 5 posts mais recentes (ajuste conforme necessário)
        .get()
        .then(querySnapshot => {
            const posts = [];
            querySnapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });
            displayRecentPosts(posts);
        })
        .catch(error => {
            console.error('Erro ao buscar posts recentes:', error);
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
            <p><strong>Autor:</strong> ${post.author}</p>
            <p>${post.content}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Imagem do post">` : ''}
            <button onclick="deletePost('${post.id}')">Excluir</button>
        `;

        recentPostsSection.appendChild(postElement);
    });
}

// Função para filtrar os posts
function filterPosts() {
    let filteredPosts = [];

    // Obtém os valores dos campos de filtro
    const titleFilter = filterTitle.value.toLowerCase();
    const dateFilter = filterDate.value;

    // Referência ao Firestore
    const db = firebase.firestore();

    // Consulta no Firestore com filtros
    db.collection('posts')
        .orderBy('timestamp', 'desc') // Ordena por data de forma decrescente
        .get()
        .then(querySnapshot => {
            querySnapshot.forEach(doc => {
                const post = doc.data();
                const postTitle = post.title.toLowerCase();
                const postDate = post.timestamp.toDate();

                // Verifica se o título do post contém o filtro de título
                // E se a data do post é maior ou igual à data filtrada
                if (postTitle.includes(titleFilter) &&
                    (!dateFilter || postDate.toISOString().split('T')[0] === dateFilter)) {
                    filteredPosts.push({ id: doc.id, ...post });
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

// Função para exibir os posts na página
function displayPosts(posts) {
    const postList = document.getElementById('postList');

    postList.innerHTML = '';

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // Monta a estrutura do post
        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p><strong>Autor:</strong> ${post.author}</p>
            <p>${post.content}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Imagem do post">` : ''}
            <button onclick="deletePost('${post.id}')">Excluir</button>
        `;

        postList.appendChild(postElement);
    });
}

// Função para alternar entre a visualização da seção de criação de posts
function toggleCreatePost() {
    const createPostSection = document.getElementById('createPost');

    if (createPostSection.style.display === 'none') {
        createPostSection.style.display = 'block';
    } else {
        createPostSection.style.display = 'none';
    }
}

// Função para criar um novo post
const postForm = document.getElementById('postForm');
postForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página

    const title = postTitle.value;
    const author = postAuthor.value;
    const content = postContent.value;
    const imageFile = document.getElementById('postImage').files[0];

    // Função para salvar o post no Firestore
    function savePost(imageUrl) {
        db.collection('posts').add({
            title: title,
            author: author,
            content: content,
            imageUrl: imageUrl || '',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then((docRef) => {
            console.log('Post adicionado com sucesso! Document ID:', docRef.id);
            postForm.reset(); // Limpa o formulário após a submissão
            toggleCreatePost(); // Oculta a seção de criação de posts após a criação
            fetchRecentPosts(); // Atualiza os posts recentes após a criação de um novo post
            alert('Post adicionado com sucesso!'); // Alerta de sucesso
        })
        .catch(error => {
            console.error('Erro ao adicionar o post: ', error);
        });
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

// Chamada inicial para exibir os posts recentes ao carregar a página
fetchRecentPosts();
