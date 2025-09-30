import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export interface CreateUserData {
  email: string
  password: string
  name?: string
  role?: Role
}

export interface UpdateUserData {
  name?: string
  avatar?: string
}

export class UserService {
  static async createUser(data: CreateUserData) {
    const { email, password, name, role = 'PARENT' } = data

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('이미 존재하는 이메일입니다.')
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10)

    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
  }

  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        children: {
          select: {
            id: true,
            name: true,
            birthDate: true,
            gender: true
          }
        },
        _count: {
          select: {
            posts: true,
            comments: true
          }
        }
      }
    })
  }

  static async updateUser(id: string, data: UpdateUserData) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        updatedAt: true
      }
    })
  }

  static async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id }
    })
  }

  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            children: true,
            posts: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  static async verifyPassword(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !user.password) {
      return null
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  }
}