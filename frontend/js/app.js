/* ==========================================================================
   app.js
   ==========================================================================
   
   

/* -------------------- Global (poori app ke) variables -------------------- */
const API_URL = "http://localhost:3000/api";
var likes = [];
var comments = [];
var follows = [];
var users = [];
var posts = [];
var currentUser = null;       // jo user login hai (ya null agar koi login nahi)
var currentFeedMode = "all";  // Home page par "all" ya "following"
var openCommentsPostId = null; // kis post ke comments khule hain (ek waqt mein ek)
var confirmCallback = null;   // "Delete?" popup mein Yes dabane par kya chalega

/* -------------------- App shuru hona -------------------- */
async function loadUsersFromAPI() {
  try {
    const response = await fetch(`${API_URL}/users`);

    users = await response.json();

    console.log("Users from MySQL:", users);

  } catch (error) {
    console.error("Users API error:", error);
  }
}


async function loadLikesFromAPI() {
  try {
    const response = await fetch(`${API_URL}/likes`);
    likes = await response.json();

    console.log("Likes from MySQL:", likes);

  } catch (error) {
    console.error("Likes API error:", error);
  }
}


async function loadCommentsFromAPI() {
  try {
    const response = await fetch(`${API_URL}/comments`);
    comments = await response.json();

    console.log("Comments from MySQL:", comments);

  } catch (error) {
    console.error("Comments API error:", error);
  }
}


async function loadFollowsFromAPI() {
  try {
    const response = await fetch(`${API_URL}/follows`);
    const data = await response.json();

    follows = data;

    console.log("Follows from MySQL:", follows);

  } catch (error) {
    console.error("Follows API error:", error);
  }
}

async function loadPostsFromAPI() {
  try {
    const response = await fetch(`${API_URL}/posts`);
    posts = await response.json();

    console.log("Posts from MySQL:", posts);
  } catch (error) {
    console.error("Posts API error:", error);
  }
}


window.onload = function () {
  loadUsersFromAPI();
  loadPostsFromAPI();   
  loadLikesFromAPI();// data.js se: localStorage se data uthao
  loadCommentsFromAPI();
  loadFollowsFromAPI();
  currentUser = getCurrentUser();   // data.js se: dekho pehle se koi login hai kya

  // Page load hote hi theme (dark/light) laga do
  var savedTheme = localStorage.getItem("VibelyTheme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  if (currentUser) {
    renderApp();  // pehle se login hai -> seedha app dikhao
  } else {
    renderAuthPage("login");  // login screen dikhao
  }
};

// Jab bhi URL ka #hissa badle (jaise #/explore), page dobara dikhao
window.onhashchange = function () {
  if (currentUser) {
    checkURL();
  }
};

/* ==========================================================================
   CHHOTE HELPER FUNCTIONS (poori app mein baar baar use honge)
   ========================================================================== */

// User ka likha text HTML mein daalne se pehle "safe" banata hai,
// warna koi <script> jaisa text likh kar app ko nuksan pohcha sakta hai
function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// "Ayesha Khan" -> "AK"
function getInitials(name) {
  var parts = name.trim().split(" ");
  var initials = parts[0].charAt(0);
  if (parts.length > 1) {
    initials = initials + parts[parts.length - 1].charAt(0);
  }
  return initials.toUpperCase();
}

// Gol avatar ka HTML (rang user ke "color" number se banta hai)
function avatarHTML(user, sizeClass) {
  var sizeAttr = sizeClass ? " avatar--" + sizeClass : "";
  return '<span class="avatar' + sizeAttr + '" style="--h:' + user.color + '">' +
    getInitials(user.name) + "</span>";
}

// ISO date ko "5m", "2h", "3d" jaisa dikhata hai
function timeAgo(dateString) {
  var then = new Date(dateString).getTime();
  var now = new Date().getTime();
  var seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "now";
  var minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + "m";
  var hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h";
  var days = Math.floor(hours / 24);
  return days + "d";
}

// Post/comment ke text mein #hashtag aur @mention ko rangeen bana deta hai
function linkifyText(text) {
  var safeText = escapeHtml(text);
  safeText = safeText.split("\n").join("<br>"); // naya line -> <br>

  var words = safeText.split(" ");
  var i;

  for (i = 0; i < words.length; i++) {
    var word = words[i];

    if (word.length > 1 && word.charAt(0) === "#") {
      words[i] = '<span class="tag">' + word + "</span>";
    } else if (word.length > 1 && word.charAt(0) === "@") {
      var username = word.substring(1);
      words[i] = '<a href="#/u/' + username + '">' + word + "</a>";
    }
  }

  return words.join(" ");
}

// Neeche ek chhota kaala message dikhata hai jo khud gayab ho jata hai
function showToast(message) {
  var toastBox = document.getElementById("toasts");
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastBox.appendChild(toast);

  setTimeout(function () {
    toast.remove();
  }, 2500);
}

/* -------------------- Popup (Modal) -------------------- */

function openModal(title, bodyHtml) {
  var root = document.getElementById("modal-root");
  root.innerHTML =
    '<div class="modal-backdrop" onclick="closeModal()">' +
    '  <div class="modal" onclick="event.stopPropagation()">' +
    '    <header class="modal__head"><h2>' + escapeHtml(title) + '</h2>' +
    '      <button class="icon-btn" onclick="closeModal()">&times;</button></header>' +
    '    <div class="modal__body">' + bodyHtml + '</div>' +
    '  </div>' +
    '</div>';
  document.body.classList.add("modal-open");
}

function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
  document.body.classList.remove("modal-open");
  confirmCallback = null;
}

// "Delete karna hai?" jaisa popup. Yes dabane par actionFunction chalta hai.
function showConfirm(title, text, actionFunction) {
  confirmCallback = actionFunction;
  openModal(title,
    '<p class="modal__text">' + escapeHtml(text) + '</p>' +
    '<div class="modal__actions">' +
    '  <button class="btn btn--ghost" onclick="closeModal()">Cancel</button>' +
    '  <button class="btn btn--danger" onclick="runConfirmedAction()">Delete</button>' +
    '</div>'
  );
}

function runConfirmedAction() {
  var action = confirmCallback;
  closeModal();
  if (action) action();
}

/* -------------------- Dark / Light mode -------------------- */

function toggleDarkMode() {
  var html = document.documentElement;
  if (html.getAttribute("data-theme") === "dark") {
    html.setAttribute("data-theme", "light");
    localStorage.setItem("VibelyTheme", "light");
  } else {
    html.setAttribute("data-theme", "dark");
    localStorage.setItem("VibelyTheme", "dark");
  }
}

/* ==========================================================================
   LOGIN / REGISTER PAGE
   ========================================================================== */

function renderAuthPage(mode) {
  var isLogin = mode === "login";

  var formFieldsHtml;
  if (isLogin) {
    formFieldsHtml =
      '<label class="field"><span>Username or email</span>' +
      '  <input class="input" id="login-identifier" required></label>' +
      '<label class="field"><span>Password</span>' +
      '  <input class="input" type="password" id="login-password" required></label>';
  } else {
    formFieldsHtml =
      '<label class="field"><span>Your name</span>' +
      '  <input class="input" id="register-name" required></label>' +
      '<label class="field"><span>Username</span>' +
      '  <input class="input" id="register-username" required></label>' +
      '<label class="field"><span>Email</span>' +
      '  <input class="input" type="email" id="register-email" required></label>' +
      '<label class="field"><span>Password (6+ characters)</span>' +
      '  <input class="input" type="password" id="register-password" required></label>';
  }

  var submitAttribute = isLogin ? 'onsubmit="return handleLoginSubmit(event)"' : 'onsubmit="return handleRegisterSubmit(event)"';

  var switchLinkHtml = isLogin
    ? 'New to Vibely? <button onclick="renderAuthPage(\'register\')">Create an account</button>'
    : 'Already have an account? <button onclick="renderAuthPage(\'login\')">Sign in</button>';

  var demoHintHtml =
    '<div class="auth__hint">Demo login: <code>ayesha</code> / <code>password123</code>' +
    '  <div class="auth__hint-actions">' +
    '    <button class="btn btn--ghost btn--sm" type="button" onclick="fillDemoLogin()">Fill demo login</button>' +
    
    '  </div></div>';

  document.getElementById("app").innerHTML =
    '<div class="auth">' +
    '  <section class="auth__art">' +
    '    <a class="brand" href="#/"><span>🪶 Vibely</span></a>' +
    '    <div>' +
    '      <h1 class="auth__title">A quieter place to say something.</h1>' +
    '      <p class="auth__lede">Share short thoughts, follow people worth reading, and keep the conversation going in the comments.</p>' +
    '    </div>' +
    '  </section>' +
    '  <section class="auth__panel">' +
    '    <div class="auth__card">' +
    '      <h2>' + (isLogin ? "Welcome back" : "Create your account") + '</h2>' +
    '      <p>' + (isLogin ? "Sign in to see what your people are saying." : "It takes less than a minute.") + '</p>' +
    '      <form class="auth__form" ' + submitAttribute + '>' +
    formFieldsHtml +
    '        <p class="form-error" id="auth-error"></p>' +
    '        <button class="btn btn--primary btn--block" type="submit">' + (isLogin ? "Sign in" : "Create account") + '</button>' +
    '      </form>' +
    '      <p class="auth__switch">' + switchLinkHtml + '</p>' +
    (isLogin ? demoHintHtml : "") +
    '    </div>' +
    '  </section>' +
    '</div>';
}

function fillDemoLogin() {
  document.getElementById("login-identifier").value = "ayesha";
  document.getElementById("login-password").value = "password123";
}



async function handleLoginSubmit(event) {
  event.preventDefault();

  var identifier = document.getElementById("login-identifier").value;
  var password = document.getElementById("login-password").value;

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: identifier,
        password: password
      })
    });

    const result = await response.json();

    if (!response.ok) {
      document.getElementById("auth-error").textContent = result.message;
      return false;
    }

    currentUser = result.user;

    setCurrentUser(currentUser.id);

    location.hash = "#/";

    renderApp();

    showToast("Welcome back, " + currentUser.name.split(" ")[0]);

  } catch (error) {
    console.error("Login error:", error);
    document.getElementById("auth-error").textContent =
      "Server se connection nahi ho saka.";
  }

  return false;
}


async function handleRegisterSubmit(event) {

  event.preventDefault();

  var name = document.getElementById("register-name").value;

  var username = document.getElementById("register-username").value;

  var email = document.getElementById("register-email").value;

  var password = document.getElementById("register-password").value;

  var result = await registerUser(username, email, name, password);

  if (!result.success) {

    document.getElementById("auth-error").textContent = result.message;

    return false;

  }

  currentUser = result.user;

  setCurrentUser(currentUser.id);

  location.hash = "#/";

  renderApp();

  showToast("Account created. Say hello!");

  return false;

}



function handleLogout() {
  logoutUser();
  currentUser = null;
  location.hash = "";
  renderAuthPage("login");
  showToast("Signed out");
}

/* ==========================================================================
   APP SHELL (sidebar + top area jo har page par dikhta hai)
   ========================================================================== */

function renderApp() {
  document.getElementById("app").innerHTML =
    // Ye upar wala bar sirf mobile (chhoti) screen par CSS se dikhaya jata hai
    '<header class="mobile-bar">' +
    '  <a class="brand" href="#/"><span>🪶 Vibely</span></a>' +
    '  <div><button class="icon-btn" onclick="toggleDarkMode()">🌙</button>' +
    '  <button class="icon-btn" onclick="handleLogout()">↩</button></div>' +
    '</header>' +
    '<div class="shell">' +
    '  <aside class="rail">' +
    '    <a class="brand" href="#/"><span>🪶 Vibely</span></a>' +
    '    <nav class="nav">' +
    '      <a class="nav__link" href="#/">🏠 <span>Home</span></a>' +
    '      <a class="nav__link" href="#/explore">🔍 <span>Explore</span></a>' +
    '      <a class="nav__link" href="#/u/' + currentUser.username + '">👤 <span>Profile</span></a>' +
    '    </nav>' +
    '    <button class="btn btn--primary btn--block rail__post" onclick="focusComposer()">New post</button>' +
    '    <div class="rail__foot">' +
    '      <button class="nav__link" onclick="toggleDarkMode()">🌙 <span>Dark mode</span></button>' +
    '      <div class="me-chip" id="me-chip"></div>' +
    '    </div>' +
    '  </aside>' +
    '  <main class="main"><div id="view"></div></main>' +
    '  <aside class="side">' +
    '    <div class="search">🔍' +
    '      <input class="input" id="sidebar-search" placeholder="Search people" onkeyup="handleSidebarSearchKey(event)"></div>' +
    '    <section class="panel"><h2 class="panel__title">Who to follow</h2><div id="suggestions"></div></section>' +
    '  </aside>' +
    '</div>' +
    // Ye neeche wala tab bar sirf mobile screen par CSS se dikhaya jata hai
    '<nav class="tabbar">' +
    '  <a href="#/">🏠<span>Home</span></a>' +
    '  <a href="#/explore">🔍<span>Explore</span></a>' +
    '  <button onclick="focusComposer()">➕<span>Post</span></button>' +
    '  <a href="#/u/' + currentUser.username + '">👤<span>Profile</span></a>' +
    '</nav>';

  renderMeChip();
  renderSuggestions();
  checkURL();
}

function renderMeChip() {
  document.getElementById("me-chip").innerHTML =
    avatarHTML(currentUser, "sm") +
    '<div class="me-chip__text"><strong>' + escapeHtml(currentUser.name) + '</strong>' +
    '<span>@' + escapeHtml(currentUser.username) + '</span></div>' +
    '<button class="icon-btn" onclick="handleLogout()">↩</button>';
}

function focusComposer() {
  if (location.hash !== "#/" && location.hash !== "") {
    location.hash = "#/";
  }
  var box = document.getElementById("composer-text");
  if (box) box.focus();
}

/* ==========================================================================
   ROUTER - dekhta hai URL mein kya likha hai aur wahi page dikhata hai
   ========================================================================== */

function checkURL() {
  var hash = location.hash; // jaise "#/u/ayesha"
  var parts = hash.split("/"); // ["#", "u", "ayesha"]

  if (parts[1] === "explore") {
    renderExplorePage("");
  } else if (parts[1] === "u" && parts[2]) {
    renderProfilePage(parts[2]);
  } else {
    renderHomePage();
  }
}

/* ==========================================================================
   HOME PAGE + NAYI POST BANANA
   ========================================================================== */

async function renderHomePage() {
  var isFollowingTab = currentFeedMode === "following";
  const url = isFollowingTab
    ? `${API_URL}/posts/following/${currentUser.id}`
    : `${API_URL}/posts`;

  const response = await fetch(url);
  const posts = await response.json();


  var postsHtml = renderPostsListHtml(posts, isFollowingTab
    ? "Follow a few people and their posts will show up here."
    : "Be the first to post something.");

  document.getElementById("view").innerHTML =
    '<header class="page-head"><h1 class="page-title">Home</h1>' +
    '  <div class="tabs">' +
    '    <button onclick="switchFeedTab(\'all\')" aria-selected="' + !isFollowingTab + '">Everyone</button>' +
    '    <button onclick="switchFeedTab(\'following\')" aria-selected="' + isFollowingTab + '">Following</button>' +
    '  </div></header>' +
    renderComposerHtml() +
    '<div id="feed">' + postsHtml + '</div>';
}

function switchFeedTab(mode) {
  currentFeedMode = mode;
  renderHomePage();
}

function renderComposerHtml() {
  return (
    '<form class="composer" onsubmit="return handleNewPostSubmit(event)">' +
    avatarHTML(currentUser, "lg") +
    '<div>' +
    '  <textarea id="composer-text" rows="2" maxlength="500" placeholder="What is on your mind, ' + escapeHtml(currentUser.name.split(" ")[0]) + '?" oninput="updateComposerCounter()"></textarea>' +
    '  <input class="input composer__img" id="composer-image" type="url" placeholder="Optional: paste an image link (https://...)">' +
    '  <div class="composer__bar">' +
    '    <span class="counter" id="composer-counter">500</span>' +
    '    <button class="btn btn--primary btn--sm" type="submit">Post</button>' +
    '  </div>' +
    '</div>' +
    '</form>'
  );
}

function updateComposerCounter() {
  var textBox = document.getElementById("composer-text");
  var left = 500 - textBox.value.length;
  document.getElementById("composer-counter").textContent = left;
}



async function handleNewPostSubmit(event) {
  event.preventDefault();

  var text = document.getElementById("composer-text").value;
  var imageUrl = document.getElementById("composer-image").value;

  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: currentUser.id,
        text: text,
        imageUrl: imageUrl
      })
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.message);
      return false;
    }

    showToast("Posted");
    renderHomePage();

  } catch (error) {
    console.error("Create post error:", error);
    showToast("Server se connection nahi ho saka.");
  }

  return false;
}



/* ==========================================================================
   EK POST KA CARD (HTML banana)
   ========================================================================== */

function renderPostsListHtml(posts, emptyMessage) {
  if (posts.length === 0) {
    return '<div class="empty"><h3>Nothing here yet</h3><p>' + escapeHtml(emptyMessage) + '</p></div>';
  }

  var html = "";
  for (var i = 0; i < posts.length; i++) {
    html = html + renderOnePostHtml(posts[i]);
  }
  return html;
}

function renderOnePostHtml(post) {
  // var author = findUserById(post.userId);
  var author = post;
  if (!author) return ""; // safety check

  var isMyPost = post.userId === currentUser.id;
  var isLiked = likes.some(function (like) {
  return like.user_id === currentUser.id && like.post_id === post.id;
});

var likeCount = likes.filter(function (like) {
  return like.post_id === post.id;
}).length;

var commentCount = comments.filter(function (comment) {
  return comment.post_id === post.id;
}).length;

  var deleteButtonHtml = "";
  if (isMyPost) {
    deleteButtonHtml = '<button class="icon-btn icon-btn--danger" onclick="handleDeletePostClick(' + post.id + ')">🗑</button>';
  }

  var imageHtml = "";
  if (post.imageUrl) {
    imageHtml = '<img class="post__image" src="' + escapeHtml(post.imageUrl) + '" alt="Post image" onerror="this.remove()">';
  }

  var likeClass = isLiked ? "act act--like is-on" : "act act--like";

  var html =
    '<article class="post">' +
    '  <a href="#/u/' + author.username + '">' + avatarHTML(author) + '</a>' +
    '  <div>' +
    '    <header class="post__head">' +
    '      <a class="post__name" href="#/u/' + author.username + '">' + escapeHtml(author.name) + '</a>' +
    '      <span class="post__handle">@' + escapeHtml(author.username) + '</span>' +
    '      <time class="post__time">' + timeAgo(post.date) + '</time>' +
    deleteButtonHtml +
    '    </header>' +
    '    <p class="post__text">' + linkifyText(post.text) + '</p>' +
    imageHtml +
    '    <div class="post__actions">' +
    '      <button class="' + likeClass + '" onclick="handleLikeClick(' + post.id + ')">' +
    '        ♥ <span>' + (likeCount || "") + '</span></button>' +
    '      <button class="act" onclick="handleToggleComments(' + post.id + ')">' +
    '        💬 <span>' + (commentCount || "") + '</span></button>' +
    '    </div>';

  // Agar is post ke comments khole hue hain, unko yahin dikha do
  if (openCommentsPostId === post.id) {
    html = html + renderCommentsSectionHtml(post.id);
  }

  html = html + '</div></article>';

  return html;
}


async function handleLikeClick(postId) {

  try {
    var alreadyLiked = likes.some(function (like) {
      return like.user_id === currentUser.id && like.post_id === postId;
    });

    const response = await fetch(`${API_URL}/likes`, {
      method: alreadyLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: currentUser.id,
        postId: postId
      })
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.message);
      return;
    }

    await loadLikesFromAPI();
    renderCurrentPage();

  } catch (error) {
    console.error("Like error:", error);
    showToast("Server se connection nahi ho saka.");
  }

}




async function handleDeletePostClick(postId) {

  showConfirm("Delete this post?", "This also removes its comments and likes.", async function () {

    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE"
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.message);
        return;
      }

      renderCurrentPage();
      showToast("Post deleted");

    } catch (error) {
      console.error("Delete post error:", error);
      showToast("Server se connection nahi ho saka.");
    }

  });

}
// Jo bhi page abhi khula hai, usko dobara render karo (data badalne ke baad)
function renderCurrentPage() {
  checkURL();
}

/* ==========================================================================
   COMMENTS
   ========================================================================== */

function handleToggleComments(postId) {
  if (openCommentsPostId === postId) {
    openCommentsPostId = null; // band karo
  } else {
    openCommentsPostId = postId; // isko kholo
  }
  renderCurrentPage();
}


function renderCommentsSectionHtml(postId) {
  var postComments = comments.filter(function (comment) {
    return comment.post_id === postId;
  });

  var listHtml = "";

  if (postComments.length === 0) {
    listHtml = '<p style="color:var(--ink-3);font-size:14px;padding:10px 0">No comments yet.</p>';
  } else {
    for (var i = 0; i < postComments.length; i++) {
      listHtml = listHtml + renderOneCommentHtml(postComments[i], postId);
    }
  }

  return (
    '<section class="comments">' +
    listHtml +
    '  <form class="comment-form" onsubmit="return handleAddComment(event, ' + postId + ')">' +
    avatarHTML(currentUser, "sm") +
    '    <input class="input" id="comment-input-' + postId + '" placeholder="Add a comment">' +
    '    <button class="btn btn--primary btn--sm" type="submit">Reply</button>' +
    '  </form>' +
    '</section>'
  );
}

function renderOneCommentHtml(comment, postId) {
  // var author = findUserById(comment.userId);
  var author = comment;
  if (!author) return "";

  var post = findPostById(postId);
  var canDelete = comment.userId === currentUser.id || post.userId === currentUser.id;

  var deleteButtonHtml = "";
  if (canDelete) {
    deleteButtonHtml = '<button class="icon-btn icon-btn--danger" onclick="handleDeleteComment(' + comment.id + ', ' + postId + ')">🗑</button>';
  }

  return (
    '<div class="comment">' +
    '  <a href="#/u/' + author.username + '">' + avatarHTML(author, "sm") + '</a>' +
    '  <div><div class="comment__head"><a href="#/u/' + author.username + '">' + escapeHtml(author.name) + '</a>' +
    '    <time>' + timeAgo(comment.date) + '</time></div>' +
    '    <p>' + linkifyText(comment.text) + '</p></div>' +
    deleteButtonHtml +
    '</div>'
  );
}

async function handleAddComment(event, postId) {
  event.preventDefault();

  var input = document.getElementById("comment-input-" + postId);
  var text = input.value;

  try {
    const response = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        postId: postId,
        userId: currentUser.id,
        text: text
      })
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.message);
      return false;
    }

    await loadCommentsFromAPI();
    renderCurrentPage();
    showToast("Comment added");

  } catch (error) {
    console.error("Add comment error:", error);
    showToast("Server se connection nahi ho saka.");
  }

  return false;
}

async function handleDeleteComment(commentId, postId) {
  try {
    const response = await fetch(`${API_URL}/comments/${commentId}`, {
      method: "DELETE"
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.message);
      return;
    }

    await loadCommentsFromAPI();
    renderCurrentPage();
    showToast("Comment deleted");

  } catch (error) {
    console.error("Delete comment error:", error);
    showToast("Server se connection nahi ho saka.");
  }
}

/* ==========================================================================
   PROFILE PAGE
   ========================================================================== */

function renderProfilePage(username) {
  var user = findUserByUsername(username);

  if (!user) {
    document.getElementById("view").innerHTML =
      '<header class="page-head page-head--plain"><h1 class="page-title">Profile</h1></header>' +
      '<div class="empty"><h3>Profile not found</h3><p>@' + escapeHtml(username) + ' does not exist.</p></div>';
    return;
  }

  var isMe = user.id === currentUser.id;
  var followersCount = getFollowerCount(user.id);
  var followingCount = getFollowingCount(user.id);
  var posts = getPostsByUsername(username);

  var actionButtonHtml;
  if (isMe) {
    actionButtonHtml = '<button class="btn btn--ghost" onclick="openEditProfileModal()">Edit profile</button>';
  } else {
    actionButtonHtml = renderFollowButtonHtml(user);
  }

  var bioHtml = user.bio
    ? '<p class="profile__bio">' + escapeHtml(user.bio) + '</p>'
    : '<p class="profile__bio is-empty">No bio yet.</p>';

  var postsHtml = renderPostsListHtml(posts, isMe ? "Share your first thought from the Home page." : "@" + username + " has not posted anything.");

  document.getElementById("view").innerHTML =
    '<header class="page-head page-head--plain"><h1 class="page-title">' + escapeHtml(user.name) + '</h1></header>' +
    '<div class="cover" style="--h:' + user.color + '"></div>' +
    '<section class="profile">' +
    '  <div class="profile__top">' + avatarHTML(user, "xl") + actionButtonHtml + '</div>' +
    '  <h2 class="profile__name">' + escapeHtml(user.name) + '</h2>' +
    '  <p class="profile__handle">@' + escapeHtml(user.username) + '</p>' +
    bioHtml +
    '  <div class="stats">' +
    '    <div class="stat"><strong>' + posts.length + '</strong><span>Posts</span></div>' +
    '    <button class="stat" onclick="openFollowersModal(\'' + user.username + '\')"><strong>' + followersCount + '</strong><span>Followers</span></button>' +
    '    <button class="stat" onclick="openFollowingModal(\'' + user.username + '\')"><strong>' + followingCount + '</strong><span>Following</span></button>' +
    '  </div>' +
    '</section>' +
    '<div id="feed">' + postsHtml + '</div>';
}

function renderFollowButtonHtml(user) {
  var alreadyFollowing = isFollowing(currentUser.id, user.id);
  var buttonClass = alreadyFollowing ? "btn btn--follow is-following" : "btn btn--follow";
  var buttonText = alreadyFollowing ? "Following" : "Follow";
  return '<button class="' + buttonClass + '" onclick="handleFollowClick(\'' + user.username + '\')">' + buttonText + '</button>';
}

async function handleFollowClick(username) {
  var user = findUserByUsername(username);

  if (!user) {
    showToast("User nahi mila");
    return;
  }

  var alreadyFollowing = isFollowing(currentUser.id, user.id);

  try {
    const response = await fetch(`${API_URL}/follows`, {
      method: alreadyFollowing ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        followerId: currentUser.id,
        followingId: user.id
      })
    });

    const result = await response.json();

    if (!response.ok) {
      showToast(result.message);
      return;
    }

    await loadFollowsFromAPI();

    renderCurrentPage();
    renderSuggestions();

    showToast(alreadyFollowing ? "Unfollowed" : "Following");

  } catch (error) {
    console.error("Follow error:", error);
    showToast("Server se connection nahi ho saka.");
  }
}

/* -------------------- Followers / Following popup -------------------- */

function openFollowersModal(username) {
  var user = findUserByUsername(username);
  var people = getFollowersList(user.id);
  openModal("Followers", renderUserListHtml(people, "No followers yet."));
}

function openFollowingModal(username) {
  var user = findUserByUsername(username);
  var people = getFollowingList(user.id);
  openModal("Following", renderUserListHtml(people, "Not following anyone yet."));
}

function renderUserListHtml(people, emptyMessage) {
  if (people.length === 0) {
    return '<div class="empty"><p>' + escapeHtml(emptyMessage) + '</p></div>';
  }

  var html = "";
  for (var i = 0; i < people.length; i++) {
    html = html + renderUserRowHtml(people[i]);
  }
  return html;
}

// Ek insaan ki row: avatar + naam + follow button (sidebar, popup, search sab mein use hoti hai)
function renderUserRowHtml(user) {
  var isMe = user.id === currentUser.id;
  var buttonHtml = isMe ? "" : renderFollowButtonHtml(user);

  return (
    '<div class="user-row">' +
    '  <a class="user-row__who" href="#/u/' + user.username + '" onclick="closeModal()">' + avatarHTML(user) +
    '    <span class="user-row__text"><strong>' + escapeHtml(user.name) + '</strong><span>@' + escapeHtml(user.username) + '</span></span></a>' +
    buttonHtml +
    '</div>'
  );
}

/* -------------------- Edit profile popup -------------------- */

var colorChoices = [265, 200, 160, 45, 25, 350, 320, 290];

function openEditProfileModal() {
  var swatchesHtml = "";
  for (var i = 0; i < colorChoices.length; i++) {
    var hue = colorChoices[i];
    var checked = hue === currentUser.color ? "checked" : "";
    swatchesHtml = swatchesHtml +
      '<label class="swatch" style="--h:' + hue + '">' +
      '<input type="radio" name="hue" value="' + hue + '" ' + checked + '><span></span></label>';
  }

  openModal("Edit profile",
    '<form class="form-pad" onsubmit="return handleSaveProfile(event)">' +
    '  <label class="field"><span>Name</span><input class="input" id="edit-name" value="' + escapeHtml(currentUser.name) + '"></label>' +
    '  <label class="field"><span>Bio</span><textarea class="input" id="edit-bio">' + escapeHtml(currentUser.bio) + '</textarea></label>' +
    '  <div class="field"><span>Avatar colour</span><div class="swatches">' + swatchesHtml + '</div></div>' +
    '  <p class="form-error" id="edit-error"></p>' +
    '  <div class="modal__actions" style="padding:0">' +
    '    <button type="button" class="btn btn--ghost" onclick="closeModal()">Cancel</button>' +
    '    <button type="submit" class="btn btn--primary">Save changes</button>' +
    '  </div>' +
    '</form>'
  );
}

async function handleSaveProfile(event) {

  event.preventDefault();

  var name = document.getElementById("edit-name").value;

  var bio = document.getElementById("edit-bio").value;

  var checkedRadio = document.querySelector('input[name="hue"]:checked');

  var color = checkedRadio ? Number(checkedRadio.value) : currentUser.color;

  var result = await updateProfile(currentUser.id, name, bio, color);

  if (!result.success) {

    document.getElementById("edit-error").textContent = result.message;

    return false;

  }

  currentUser = result.user;

  closeModal();

  renderMeChip();

  renderCurrentPage();

  showToast("Changes saved");

  return false;

}
/* ==========================================================================
   EXPLORE PAGE + SEARCH
   ========================================================================== */

function renderExplorePage(searchText) {
  var results = searchUsers(searchText);

  var listHtml = "";
  if (results.length === 0) {
    listHtml = '<div class="empty"><h3>No one found</h3><p>Try a different name.</p></div>';
  } else {
    for (var i = 0; i < results.length; i++) {
      listHtml = listHtml + renderUserRowHtml(results[i]);
    }
  }

  document.getElementById("view").innerHTML =
    '<header class="page-head page-head--plain"><h1 class="page-title">Explore</h1>' +
    '  <div class="search" style="margin-top:12px">🔍' +
    '    <input class="input" id="explore-search" value="' + escapeHtml(searchText) + '"' +
    '      placeholder="Search by name or username" onkeyup="handleExploreSearchKey()"></div></header>' +
    '<div class="people">' + listHtml + '</div>';
}

function handleExploreSearchKey() {
  var text = document.getElementById("explore-search").value;
  var results = searchUsers(text);

  var listHtml = "";
  if (results.length === 0) {
    listHtml = '<div class="empty"><h3>No one found</h3><p>Try a different name.</p></div>';
  } else {
    for (var i = 0; i < results.length; i++) {
      listHtml = listHtml + renderUserRowHtml(results[i]);
    }
  }

  document.querySelector(".people").innerHTML = listHtml;
}

// Sidebar ke search box mein Enter dabane par Explore page khol do
function handleSidebarSearchKey(event) {
  if (event.key === "Enter") {
    var text = document.getElementById("sidebar-search").value;
    location.hash = "#/explore";
    renderExplorePage(text);
  }
}

/* -------------------- "Who to follow" sidebar box -------------------- */

function renderSuggestions() {
  var box = document.getElementById("suggestions");
  if (!box) return;

  var people = getSuggestedUsers(currentUser.id);

  if (people.length === 0) {
    box.innerHTML = '<p style="padding:0 18px 14px;color:var(--ink-3)">You are following everyone.</p>';
    return;
  }

  var html = "";
  for (var i = 0; i < people.length; i++) {
    html = html + renderUserRowHtml(people[i]);
  }
  box.innerHTML = html;
}
