import { prisma, Organization, Prisma } from "@repo/database";
import { BaseService } from "./base-service";

export class OrgService extends BaseService {
  async createOrg(values: Prisma.OrganizationCreateInput) {
    try {
      const newOrg = await prisma.organization.create({
        data: values,
      });
      return newOrg;
    } catch (error) {
      throw new Error(
        `Error creating organization: ${(error as Error).message}`,
      );
    }
  }

  async deleteOrg(orgId: string) {
    try {
      const exists = await this.getOrgById(orgId);

      if (!exists) {
        throw new Error(`org does not exists with this id.`);
      }

      await prisma.organization.delete({
        where: { id: orgId },
      });
      return { message: "Organization deleted successfully" };
    } catch (error) {
      throw new Error(
        `Error deleting organization: ${(error as Error).message}`,
      );
    }
  }

  async updateOrg(orgId: string, values: Prisma.OrganizationUpdateInput) {
    try {
      const exists = await this.getOrgById(orgId);

      if (!exists) {
        throw new Error(`org does not exists with this id.`);
      }

      const updatedOrg = await prisma.organization.update({
        where: { id: orgId },
        data: values,
      });
      return updatedOrg;
    } catch (error) {
      throw new Error(
        `Error updating organization: ${(error as Error).message}`,
      );
    }
  }

  async getOrgById(orgId: string) {
    try {
      const organization = await prisma.organization.findUnique({
        where: { id: orgId },
      });
      if (!organization) {
        throw new Error("Organization not found");
      }
      return organization;
    } catch (error) {
      throw new Error(
        `Error retrieving organization: ${(error as Error).message}`,
      );
    }
  }

  async getAllOrgs(filters?: Prisma.OrganizationWhereInput) {
    try {
      const organizations = await prisma.organization.findMany({
        where: filters,
      });
      return organizations;
    } catch (error) {
      throw new Error(
        `Error retrieving organizations: ${(error as Error).message}`,
      );
    }
  }
}
