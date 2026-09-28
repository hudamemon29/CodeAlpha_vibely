function findUserById(id) {

  for (var i = 0; i < users.length; i++) {

    if (users[i].id === id) {
      return users[i];
    }

  }

  return null;

}


function findUserByUsername(username) {

  username = username.toLowerCase();

  for (var i = 0; i < users.length; i++) {

    if (users[i].username.toLowerCase() === username) {
      return users[i];
    }

  }

  return null;

}


function findPostById(id) {

  for (var i = 0; i < posts.length; i++) {

    if (posts[i].id === id) return posts[i];

  }

  return null;

}

/* -------------------- Login / Register / Logout -------------------- */

async function registerUser(username, email, name, password) {

  if (username.length < 3) {
    return {
      success: false,
      message: "Username kam se kam 3 letters ka hona chahiye."
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password kam se kam 6 characters ka hona chahiye."
    };
  }

  try {

    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        email: email,
        name: name,
        password: password
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message
      };
    }

    users.push(result.user);

    return {
      success: true,
      user: result.user
    };

  } catch (error) {

    console.error("Register error:", error);

    return {
      success: false,
      message: "Server se connection nahi ho saka."
    };

  }

}




function getCurrentUser() {
  var id = localStorage.getItem("plumeCurrentUserId");
  if (!id) return null;
  return findUserById(Number(id));
}

function setCurrentUser(userId) {
  localStorage.setItem("plumeCurrentUserId", userId);
}

function logoutUser() {
  localStorage.removeItem("plumeCurrentUserId");
}



/* -------------------- Posts -------------------- */

function createPost(userId, text, imageUrl) {
  if (text.trim().length === 0) {
    return { success: false, message: "Post likhna zaroori hai." };
  }

  var newPost = {
    id: appData.nextPostId,
    userId: userId,
    text: text.trim(),
    imageUrl: imageUrl.trim(),
    date: new Date().toISOString()
  };

  appData.posts.unshift(newPost); // unshift = list ke SHURU mein dalta hai
  appData.nextPostId = appData.nextPostId + 1;
  saveData();

  return { success: true, post: newPost };
}

function deletePost(postId) {
  appData.posts = appData.posts.filter(function (p) {
    return p.id !== postId;
  });
  appData.comments = appData.comments.filter(function (c) {
    return c.postId !== postId;
  });
  appData.likes = appData.likes.filter(function (l) {
    return l.postId !== postId;
  });
  saveData();
}

// mode: "all" -> sab posts, "following" -> sirf jinko follow kiya hai
function getFeedPosts(mode, currentUserId) {
  var list = appData.posts.slice(); // ek copy bana lo, asli array ko na chhedein

  if (mode === "following" && currentUserId) {
  list = list.filter(function (p) {
    return p.userId === currentUserId ||
      follows.some(function (follow) {
        return follow.follower_id === currentUserId &&
               follow.following_id === p.userId;
      });
  });
}

  // nayi posts sabse upar
  list.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  return list;
}

function getPostsByUsername(username) {

  var user = findUserByUsername(username);

  if (!user) return [];

  var list = [];

  for (var i = 0; i < posts.length; i++) {

    if (posts[i].userId === user.id) {
      list.push(posts[i]);
    }

  }

  list.sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  return list;

}

/* -------------------- Likes -------------------- */

function isPostLikedByMe(postId, userId) {
  for (var i = 0; i < appData.likes.length; i++) {
    if (appData.likes[i].postId === postId && appData.likes[i].userId === userId) {
      return true;
    }
  }
  return false;
}

function getLikeCount(postId) {
  var count = 0;
  for (var i = 0; i < appData.likes.length; i++) {
    if (appData.likes[i].postId === postId) count = count + 1;
  }
  return count;
}

/* -------------------- Comments -------------------- */

function getCommentsForPost(postId) {
  var list = appData.comments.filter(function (c) {
    return c.postId === postId;
  });

  list.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date); // purane comment pehle
  });

  return list;
}

function getCommentCount(postId) {
  return getCommentsForPost(postId).length;
}



/* -------------------- Follow / Unfollow -------------------- */

function isFollowing(followerId, followingId) {

  for (var i = 0; i < follows.length; i++) {

    var f = follows[i];

    if (f.follower_id === followerId && f.following_id === followingId) {
      return true;
    }

  }

  return false;

}

function getFollowerCount(userId) {
  var count = 0;

  for (var i = 0; i < follows.length; i++) {
    if (follows[i].following_id === userId) {
      count = count + 1;
    }
  }

  return count;
}

function getFollowingCount(userId) {
  var count = 0;

  for (var i = 0; i < follows.length; i++) {
    if (follows[i].follower_id === userId) {
      count = count + 1;
    }
  }

  return count;
}


function getFollowersList(userId) {
  var people = [];

  for (var i = 0; i < follows.length; i++) {
    if (follows[i].following_id === userId) {
      var u = findUserById(follows[i].follower_id);

      if (u) {
        people.push(u);
      }
    }
  }

  return people;
}

function getFollowingList(userId) {
  var people = [];

  for (var i = 0; i < follows.length; i++) {
    if (follows[i].follower_id === userId) {
      var u = findUserById(follows[i].following_id);

      if (u) {
        people.push(u);
      }
    }
  }

  return people;
}

// Un logon ki list jinko main follow NAHI karta
function getSuggestedUsers(currentUserId) {

  var suggestions = [];

  for (var i = 0; i < users.length; i++) {

    var u = users[i];

    if (u.id !== currentUserId && !isFollowing(currentUserId, u.id)) {

      suggestions.push(u);

    }

  }

  return suggestions.slice(0, 5); // sirf pehle 5

}

/* -------------------- Search -------------------- */

function searchUsers(text) {

  text = text.trim().toLowerCase();

  if (text === "") return users.slice();

  return users.filter(function (u) {

    return u.username.toLowerCase().indexOf(text) !== -1 || u.name.toLowerCase().indexOf(text) !== -1;

  });

}
