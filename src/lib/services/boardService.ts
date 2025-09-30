import { prisma } from '@/lib/prisma'

export interface CreatePostData {
  title: string
  content: string
  boardId: string
  authorId: string
}

export interface UpdatePostData {
  title?: string
  content?: string
}

export interface PostListQuery {
  page?: number
  limit?: number
  search?: string
  boardId?: string
}

export class BoardService {
  static async getActiveBoards() {
    return prisma.board.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        order: true,
        _count: {
          select: {
            posts: {
              where: { isPublished: true }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })
  }

  static async getBoardById(id: string) {
    return prisma.board.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            posts: {
              where: { isPublished: true }
            }
          }
        }
      }
    })
  }

  static async createPost(data: CreatePostData) {
    return prisma.post.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  static async getPostById(id: string) {
    // 조회수 증가
    await prisma.post.update({
      where: { id },
      data: { views: { increment: 1 } }
    })

    return prisma.post.findUnique({
      where: { id, isPublished: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        board: {
          select: {
            id: true,
            name: true
          }
        },
        comments: {
          where: { parentId: null },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true
              }
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    role: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async getPosts(query: PostListQuery) {
    const { page = 1, limit = 10, search, boardId } = query
    const skip = (page - 1) * limit

    let whereCondition: any = {
      isPublished: true
    }

    if (boardId) {
      whereCondition.boardId = boardId
    }

    if (search) {
      whereCondition.OR = [
        { title: { contains: search } },
        { content: { contains: search } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: whereCondition,
        select: {
          id: true,
          title: true,
          content: true,
          views: true,
          isSticky: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              name: true
            }
          },
          board: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: [
          { isSticky: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.post.count({ where: whereCondition })
    ])

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  static async updatePost(id: string, authorId: string, data: UpdatePostData, isAdmin = false) {
    // 작성자 또는 관리자인지 확인
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      throw new Error('게시글을 찾을 수 없습니다.')
    }

    if (existingPost.authorId !== authorId && !isAdmin) {
      throw new Error('권한이 없습니다.')
    }

    return prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  }

  static async deletePost(id: string, authorId: string, isAdmin = false) {
    // 작성자 또는 관리자인지 확인
    const existingPost = await prisma.post.findUnique({
      where: { id }
    })

    if (!existingPost) {
      throw new Error('게시글을 찾을 수 없습니다.')
    }

    if (existingPost.authorId !== authorId && !isAdmin) {
      throw new Error('권한이 없습니다.')
    }

    return prisma.post.delete({
      where: { id }
    })
  }

  static async getRecentPosts(limit = 5) {
    return prisma.post.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        views: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true
          }
        },
        board: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: [
        { isSticky: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })
  }

  static async createComment(postId: string, authorId: string, content: string, parentId?: string) {
    return prisma.comment.create({
      data: {
        content,
        postId,
        authorId,
        parentId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    })
  }

  static async deleteComment(id: string, authorId: string, isAdmin = false) {
    const existingComment = await prisma.comment.findUnique({
      where: { id }
    })

    if (!existingComment) {
      throw new Error('댓글을 찾을 수 없습니다.')
    }

    if (existingComment.authorId !== authorId && !isAdmin) {
      throw new Error('권한이 없습니다.')
    }

    return prisma.comment.delete({
      where: { id }
    })
  }
}