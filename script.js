// Importation des modules Firebase (à configurer dans votre projet)
// Assurez-vous d'avoir ajouté Firebase à votre projet (via CDN ou npm si bundling)
// Exemple avec CDN:
// <script src="https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.x.x/firebase-auth-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore-compat.js"></script>

// Configuration Firebase (remplacez avec vos propres informations)
const firebaseConfig = {
    apiKey: "AIzaSyBzxLd2CtrDwrbdvCpJcmWreCFYzus4pxc",
  authDomain: "cocoapp-59806.firebaseapp.com",
  projectId: "cocoapp-59806",
  storageBucket: "cocoapp-59806.firebasestorage.app",
  messagingSenderId: "150646140905",
  appId: "1:150646140905:web:fe18d100afd0d88dc9e578",
  measurementId: "G-47KFT0SRS4"
};

// Initialisation de Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore(); // Utilisation de Firestore

// Sélection des éléments HTML
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const logoutButton = document.getElementById('logout-button');
const userInfoSpan = document.getElementById('user-email');
const challengeTextDisplay = document.getElementById('challenge-text');
const postForm = document.getElementById('post-form');
const postContentInput = document.getElementById('post-content');
const postImageInput = document.getElementById('post-image');
const postAudioInput = document.getElementById('post-audio');
const submitPostButton = document.getElementById('submit-post-button');
const postsListDiv = document.getElementById('posts-list');

// Défis aléatoires (ajoutez plus de défis)
const challenges = [
    "Prends une photo d'un objet bleu.",
    "Écris un poème en 5 minutes.",
    "Enregistre un son amusant avec ta voix.",
    "Trouve et photographie la chose la plus petite que tu puisses trouver dehors.",
    "Dessine ton emoji préféré avec des objets du quotidien."
];

let currentChallenge = "";

// Fonction pour choisir un défi aléatoire
function getRandomChallenge() {
    return challenges[Math.floor(Math.random() * challenges.length)];
}

// Fonction pour afficher le défi
function displayChallenge() {
    currentChallenge = getRandomChallenge();
    challengeTextDisplay.textContent = currentChallenge;
}

// Fonction pour créer un post sur Firebase
async function createPost(content, imageFile, audioFile, userId, userEmail) {
    try {
        const postData = {
            userId: userId,
            userEmail: userEmail,
            challenge: currentChallenge,
            content: content,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            reactions: {
                votes: 0,
                likes: 0
            }
        };

        if (imageFile) {
            // Télécharger l'image sur Firebase Storage (à implémenter)
            // et obtenir l'URL de téléchargement
            console.log("Image upload is not yet implemented in this basic example.");
            // postData.imageUrl = imageUrlFromStorage;
        }
        if (audioFile) {
            // Télécharger l'audio sur Firebase Storage (à implémenter)
            // et obtenir l'URL de téléchargement
            console.log("Audio upload is not yet implemented in this basic example.");
            // postData.audioUrl = audioUrlFromStorage;
        }

        await db.collection('posts').add(postData);
        alert('Réponse postée avec succès !');
        postContentInput.value = '';
        postImageInput.value = '';
        postAudioInput.value = '';
        fetchPosts(); // Rafraîchir la liste des posts
    } catch (error) {
        console.error("Erreur lors de la création du post:", error);
        alert('Erreur lors de la publication de la réponse.');
    }
}


// Fonction pour récupérer et afficher les posts depuis Firebase
async function fetchPosts() {
    postsListDiv.innerHTML = ''; // Vider la liste actuelle

    try {
        const postsSnapshot = await db.collection('posts').orderBy('timestamp', 'desc').get();
        postsSnapshot.forEach(doc => {
            const post = doc.data();
            const postId = doc.id;
            const postElement = createPostElement(postId, post);
            postsListDiv.prepend(postElement); // Ajouter au début pour afficher les plus récents en premier
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des posts:", error);
        postsListDiv.innerHTML = '<p>Erreur lors du chargement des réponses.</p>';
    }
}

// Fonction pour créer un élément HTML pour un post
function createPostElement(postId, postData) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <span class="post-author">${postData.userEmail}</span>
            <span class="post-challenge">Défi: ${postData.challenge}</span>
        </div>
        <div class="post-content">
            <p>${postData.content || ''}</p>
            ${postData.imageUrl ? `<img src="${postData.imageUrl}" alt="Image du post">` : ''}
            ${postData.audioUrl ? `<audio controls src="${postData.audioUrl}"></audio>` : ''}
        </div>
        <div class="post-actions">
            <button class="vote-button" data-post-id="${postId}">Voter</button>
            <button class="like-button" data-post-id="${postId}">J'aime</button>
            <span class="reactions-count">Votes: ${postData.reactions.votes || 0}, Likes: ${postData.reactions.likes || 0}</span>
        </div>
    `;

    // Ajout des listeners pour les boutons de vote et like (exemple basique)
    const voteButton = postDiv.querySelector('.vote-button');
    const likeButton = postDiv.querySelector('.like-button');

    voteButton.addEventListener('click', () => {
        updateReaction(postId, 'votes');
    });

    likeButton.addEventListener('click', () => {
        updateReaction(postId, 'likes');
    });

    return postDiv;
}

// Fonction pour mettre à jour les réactions (votes, likes) sur Firebase
async function updateReaction(postId, reactionType) {
    try {
        const postRef = db.collection('posts').doc(postId);
        const increment = firebase.firestore.FieldValue.increment(1);

        let updateObject = {};
        if (reactionType === 'votes') {
            updateObject['reactions.votes'] = increment;
        } else if (reactionType === 'likes') {
            updateObject['reactions.likes'] = increment;
        }

        await postRef.update(updateObject);
        fetchPosts(); // Rafraîchir les posts pour mettre à jour l'affichage des réactions
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la réaction:", error);
        alert('Erreur lors de la mise à jour de la réaction.');
    }
}


// --- AUTHENTIFICATION ---
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = signupForm.signupEmail.value;
    const password = signupForm.signupPassword.value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        alert('Inscription réussie ! Connectez-vous.');
        authSection.style.display = 'block'; // Afficher la section d'authentification
        appSection.style.display = 'none';   // Cacher la section principale de l'app
        signupForm.reset();
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        alert('Erreur lors de l\'inscription: ' + error.message);
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.loginEmail.value;
    const password = loginForm.loginPassword.value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // Le code après la connexion réussie est géré dans l'observeur d'état d'authentification (authStateObserver)
        loginForm.reset();
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        alert('Erreur lors de la connexion: ' + error.message);
    }
});

logoutButton.addEventListener('click', async () => {
    try {
        await auth.signOut();
        // Le code après la déconnexion est géré dans l'observeur d'état d'authentification (authStateObserver)
    } catch (error) {
        console.error("Erreur lors de la déconnexion:", error);
        alert('Erreur lors de la déconnexion.');
    }
});

// Observeur d'état d'authentification (pour gérer l'état connecté/déconnecté)
auth.onAuthStateChanged(user => {
    if (user) {
        // Utilisateur connecté
        authSection.style.display = 'none'; // Cacher la section d'authentification
        appSection.style.display = 'block';   // Afficher la section principale de l'app
        userInfoSpan.textContent = user.email;
        displayChallenge(); // Afficher le défi du jour
        fetchPosts();      // Charger les posts
    } else {
        // Utilisateur déconnecté
        authSection.style.display = 'block'; // Afficher la section d'authentification
        appSection.style.display = 'none';   // Cacher la section principale de l'app
        userInfoSpan.textContent = '';
        postsListDiv.innerHTML = ''; // Vider la liste des posts
        challengeTextDisplay.textContent = 'Connectez-vous pour voir le défi';
    }
});

// --- GESTION DES POSTS ---
submitPostButton.addEventListener('click', async () => {
    const content = postContentInput.value;
    const imageFile = postImageInput.files[0];
    const audioFile = postAudioInput.files[0];
    const user = auth.currentUser;

    if (user) {
        createPost(content, imageFile, audioFile, user.uid, user.email);
    } else {
        alert('Vous devez être connecté pour poster une réponse.');
    }
});


// --- SERVICE WORKER (Pour PWA - fichier séparé service-worker.js) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker enregistré avec succès:', registration);
            })
            .catch(error => {
                console.log('Erreur lors de l\'enregistrement du Service Worker:', error);
            });
    });
}
