import { prisma } from "./lib/prisma.js";

async function addLike(userId: string, postId: string) {
  console.log(`用戶 ${userId} 點讚了 ${postId}`);

  // 用 transaction 確保數據一致性
  await prisma.$transaction(async (tx) => {
    await tx.likeRecord.create({
      data: { userId, postId },
    });

    await tx.postStats.upsert({
      where: { postId },
      create: { postId, likeCount: 1 },
      update: { likeCount: { increment: 1 } },
    });
  });

  console.log("點讚成功");
}

async function removeLike(userId: string, postId: string) {
  console.log(`用戶 ${userId} 取消點讚 ${postId}`);

  await prisma.$transaction(async (tx) => {
    await tx.likeRecord.delete({
      where: { userId_postId: { userId, postId } },
    });

    await tx.postStats.update({
      where: { postId },
      data: { likeCount: { decrement: 1 } },
    });
  });

  console.log("取消點讚成功");
}

async function getLikeCount(postId: string) {
  const stats = await prisma.postStats.findUnique({
    where: { postId },
  });
  if (stats === null){
    return 0;
  }
  return stats.likeCount;
}

async function hasUserLiked(userId: string, postId: string) {
  const record = await prisma.likeRecord.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  return record !== null;
}
export { addLike, removeLike, getLikeCount, hasUserLiked };  