import { CmsArticleTag } from "@prisma/client";
import { getTagPostCount } from "../models/articleTagPost";
import { createTag, getTagByQuery, updateTag } from "../models/tag";
import prisma from "@/lib/prisma";

// 创建tag，如果存在则跳过
export async function createTagService(tagName, tx = prisma) {
  const existTag = await getTagByQuery(
    {
      name: tagName
    },
    tx
  );
  let tag: CmsArticleTag = null;
  if (!existTag) {
    tag = await createTag(
      {
        name: tagName,
        articleCount: 1
      },
      tx
    );
  } else {
    const { tagId } = existTag;
    const count = await getTagPostCount(tagId, tx);
    tag = await updateTag(
      tagId,
      {
        articleCount: count
      },
      tx
    );
  }
  return tag;
}
