import express from "express";
import cors from "cors";
import {
  addLike,
  removeLike,
  getLikeCount,
  hasUserLiked,
} from "./db_service.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/like", async (req, res) => {
  const { userId, postId } = req.body;
  try {
    await addLike(userId, postId);
    res.json({ message: "按讚成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "按讚失敗" });
  }
});

app.post("/api/unlike", async (req, res) => {
  const { userId, postId } = req.body;
  try {
    await removeLike(userId, postId);
    res.json({ message: "取消按讚成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "取消按讚失敗" });
  }
});

app.get("/api/like-count/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const count = await getLikeCount(postId);
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "查詢失敗" });
  }
});

app.get("/api/has-liked/:userId/:postId", async (req, res) => {
  const { userId, postId } = req.params;
  try {
    const liked = await hasUserLiked(userId, postId);
    res.json({ liked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "查詢失敗" });
  }
});

app.listen(3000, () => {
  console.log("服務已啟動於 Port 3000");
});
