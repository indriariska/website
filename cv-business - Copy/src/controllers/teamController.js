const Response = require('../utils/response');
const prisma = require('../config/database');

class TeamController {
  static async getAllTeamMembers(req, res, next) {
    try {
      const teamMembers = await prisma.teamMember.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

      return Response.success(res, teamMembers, 'Team members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getTeamMemberById(req, res, next) {
    try {
      const { id } = req.params;

      const member = await prisma.teamMember.findUnique({
        where: { id },
      });

      if (!member) {
        return Response.error(res, 'Team member not found', 404);
      }

      return Response.success(res, member, 'Team member retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async createTeamMember(req, res, next) {
    try {
      const { name, role, description, socialLinks } = req.body;
      const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const member = await prisma.teamMember.create({
        data: {
          name,
          role,
          description,
          photoUrl,
          socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
          isActive: true,
        },
      });

      return Response.success(res, member, 'Team member created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateTeamMember(req, res, next) {
    try {
      const { id } = req.params;
      const { name, role, description, socialLinks, isActive } = req.body;
      const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

      const member = await prisma.teamMember.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(role && { role }),
          ...(description !== undefined && { description }),
          ...(photoUrl && { photoUrl }),
          ...(socialLinks && { socialLinks: JSON.parse(socialLinks) }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return Response.success(res, member, 'Team member updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteTeamMember(req, res, next) {
    try {
      const { id } = req.params;

      await prisma.teamMember.delete({
        where: { id },
      });

      return Response.success(res, null, 'Team member deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TeamController;
