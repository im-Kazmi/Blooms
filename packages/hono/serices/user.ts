import { prisma, Prisma } from "@repo/database";
import { BaseService } from "./base-service";

export class UserService extends BaseService {
  async createUser(values: Prisma.UserCreateInput) {
    try {
      const newUser = await prisma.user.create({
        data: values,
      });
      return newUser;
    } catch (error) {
      throw new Error(`Error creating user: ${(error as Error).message}`);
    }
  }

  async deleteUser(id: string) {
    try {
      await prisma.user.delete({
        where: { clerkId: id },
      });
      return { message: "us deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting user: ${(error as Error).message}`);
    }
  }

  async updateUser(id: string, values: Prisma.UserUpdateInput) {
    try {
      const updatedUser = await prisma.user.update({
        where: { clerkId: id },
        data: values,
      });
      return updatedUser;
    } catch (error) {
      throw new Error(`Error updating user: ${(error as Error).message}`);
    }
  }

  async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: id },
      });
      if (!user) {
        throw new Error("user not found");
      }
      return user;
    } catch (error) {
      throw new Error(`Error retrieving user: ${(error as Error).message}`);
    }
  }
}
