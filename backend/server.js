const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Vibely Backend is running!");
});

app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Users fetch nahi ho sake",
    });
  }
});

app.get("/api/posts", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id,
        p.user_id AS userId,
        p.text,
        p.image_url AS imageUrl,
        p.created_at AS date,
        u.username,
        u.email,
        u.name,
        u.bio,
        u.color
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Posts fetch nahi ho sake",
    });
  }
});

// Create new post API
app.post("/api/posts", async (req, res) => {
  try {
    const { userId, text, imageUrl } = req.body;

    // if (!userId || !text || !text.trim()) {
    //   return res.status(400).json({
    //     message: "Post text zaroori hai",
    //   });
    // }
if (!userId || (!text || !text.trim()) && !imageUrl) {
  return res.status(400).json({
    message: "Post mein text ya image zaroor honi chahiye",
  });
}
    const [result] = await db.query(
      "INSERT INTO posts (user_id, text, image_url) VALUES (?, ?, ?)",
      // [userId, text.trim(), imageUrl || null]
      [userId, text ? text.trim() : "", imageUrl || null]
    );

    const [rows] = await db.query(`
      SELECT
        p.id,
        p.user_id AS userId,
        p.text,
        p.image_url AS imageUrl,
        p.created_at AS date,
        u.username,
        u.email,
        u.name,
        u.bio,
        u.color
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: "Post created successfully",
      post: rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Post create nahi ho saki",
    });
  }
});


app.delete("/api/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    const [result] = await db.query(
      "DELETE FROM posts WHERE id = ?",
      [postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Post nahi mili",
      });
    }

    res.json({
      message: "Post deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Post delete nahi ho saki",
    });
  }
});




app.get("/api/posts/following/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const [rows] = await db.query(`
      SELECT
        p.id,
        p.user_id AS userId,
        p.text,
        p.image_url AS imageUrl,
        p.created_at AS date,
        u.username,
        u.email,
        u.name,
        u.bio,
        u.color
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN follows f ON f.following_id = p.user_id
      WHERE f.follower_id = ?
      ORDER BY p.created_at DESC
    `, [userId]);

    res.json(rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Following posts fetch nahi ho sake",
    });
  }
});

//get comments request

app.get("/api/comments", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        c.id,
        c.post_id AS postId,
        c.user_id AS userId,
        c.text,
        c.created_at AS date,
        u.username,
        u.email,
        u.name,
        u.bio,
        u.color
      FROM comments c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at ASC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Comments fetch nahi ho sake",
    });
  }
});

//post commet request
app.post("/api/comments", async (req, res) => {
  try {
    const { postId, userId, text } = req.body;

    if (!postId || !userId || !text || !text.trim()) {
      return res.status(400).json({
        message: "Comment text zaroori hai",
      });
    }

    const [result] = await db.query(
      "INSERT INTO comments (post_id, user_id, text) VALUES (?, ?, ?)",
      [postId, userId, text.trim()]
    );

    const [rows] = await db.query(`
      SELECT
        c.id,
        c.post_id AS postId,
        c.user_id AS userId,
        c.text,
        c.created_at AS date,
        u.username,
        u.name,
        u.bio,
        u.color
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: "Comment added successfully",
      comment: rows[0],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Comment add nahi ho saka",
    });
  }
});

//delete comments request

app.delete("/api/comments/:id", async (req, res) => {
  try {
    const commentId = req.params.id;

    const [result] = await db.query(
      "DELETE FROM comments WHERE id = ?",
      [commentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Comment nahi mila" });
    }

    res.json({ message: "Comment deleted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Comment delete nahi ho saka" });
  }
});

//get request of likes
app.get("/api/likes", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM likes");

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Likes fetch nahi ho sake",
    });
  }
});

//post reaquest of likes
app.post("/api/likes", async (req, res) => {
  try {
    const { userId, postId } = req.body;

    if (!userId || !postId) {
      return res.status(400).json({
        message: "userId aur postId zaroori hain",
      });
    }

    await db.query(
      "INSERT INTO likes (user_id, post_id) VALUES (?, ?)",
      [userId, postId]
    );

    res.status(201).json({
      message: "Post liked successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Like nahi ho saka",
    });
  }
});

//delete likes
app.delete("/api/likes", async (req, res) => {
  try {
    const { userId, postId } = req.body;

    if (!userId || !postId) {
      return res.status(400).json({
        message: "userId aur postId zaroori hain",
      });
    }

    const [result] = await db.query(
      "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
      [userId, postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Like nahi mila",
      });
    }

    res.json({
      message: "Post unliked successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Unlike nahi ho saka",
    });
  }
});


// get follow request
app.get("/api/follows", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM follows");

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Follows fetch nahi ho sake",
    });
  }
});

//post and delete request of follow
app.post("/api/follows", async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({
        message: "followerId aur followingId zaroori hain"
      });
    }

    if (followerId === followingId) {
      return res.status(400).json({
        message: "Apne aap ko follow nahi kar sakte"
      });
    }

    const [existing] = await db.query(
      "SELECT * FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Already following"
      });
    }

    await db.query(
      "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)",
      [followerId, followingId]
    );

    res.status(201).json({
      message: "Followed successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Follow nahi ho saka"
    });
  }
});


app.delete("/api/follows", async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
      return res.status(400).json({
        message: "followerId aur followingId zaroori hain"
      });
    }

    const [result] = await db.query(
      "DELETE FROM follows WHERE follower_id = ? AND following_id = ?",
      [followerId, followingId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Follow nahi mila"
      });
    }

    res.json({
      message: "Unfollowed successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unfollow nahi ho saka"
    });
  }
});

//put req of login  

app.put("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, bio, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Naam khali nahi ho sakta."
      });
    }

    const [result] = await db.query(
      "UPDATE users SET name = ?, bio = ?, color = ? WHERE id = ?",
      [name.trim(), bio ? bio.trim() : "", color, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "User nahi mila."
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      message: "Profile updated successfully",
      user: rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Profile update nahi ho saki"
    });
  }
});

//post req of register

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, name, password } = req.body;

    if (!username || username.length < 3) {
      return res.status(400).json({
        message: "Username kam se kam 3 letters ka hona chahiye."
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password kam se kam 6 characters ka hona chahiye."
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Username ya email pehle se liya hua hai."
      });
    }

    const color = Math.floor(Math.random() * 360);

    const [result] = await db.query(
      `INSERT INTO users
       (username, email, name, password_hash, bio, color)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, name, password, "", color]
    );

    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Account successfully create ho gaya",
      user: rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Registration nahi ho saki"
    });
  }
});

//post login request
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ? AND password_hash = ?",
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Username ya password incorrect hai",
      });
    }

    const user = rows[0];

    res.json({
      message: "Login successful",
      user: user,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login nahi ho saka",
    });
  }
});

app.listen(port, () => {
  console.log(`Vibely backend running on port ${port}`);
});