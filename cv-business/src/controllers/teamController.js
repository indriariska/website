const Response = require('../utils/response');
const prisma = require('../config/database');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

class TeamController {
  static async getAllTeamMembers(req, res, next) {
    try {
      const teamMembers = await prisma.teamMember.findMany({
        where: { isActive: true }, orderBy: { createdAt: 'desc' },
      });
      return Response.success(res, teamMembers, 'Team members retrieved successfully');
    } catch (error) { next(error); }
  }

  static async getTeamMemberById(req, res, next) {
    try {
      const member = await prisma.teamMember.findUnique({ where: { id: req.params.id } });
      if (!member) return Response.error(res, 'Team member not found', 404);
      return Response.success(res, member, 'Team member retrieved successfully');
    } catch (error) { next(error); }
  }

  static async createTeamMember(req, res, next) {
    try {
      const { name, role, description, socialLinks } = req.body;
      const photoUrl = (req.file && req.file.buffer)
        ? await uploadToCloudinary(req.file.buffer, 'cvpro-studio/team')
        : null;
      const member = await prisma.teamMember.create({
        data: {
          name, role, description, photoUrl,
          socialLinks: socialLinks ? JSON.parse(socialLinks) : {},
          isActive: true,
        },
      });
      return Response.success(res, member, 'Team member created successfully', 201);
    } catch (error) { next(error); }
  }

  static async updateTeamMember(req, res, next) {
    try {
      const { name, role, description, socialLinks, isActive } = req.body;
      const photoUrl = (req.file && req.file.buffer)
        ? await uploadToCloudinary(req.file.buffer, 'cvpro-studio/team')
        : undefined;
      const member = await prisma.teamMember.update({
        where: { id: req.params.id },
        data: {
          ...(name        !== undefined && { name }),
          ...(role        !== undefined && { role }),
          ...(description !== undefined && { description }),
          ...(photoUrl    !== undefined && { photoUrl }),
          ...(socialLinks !== undefined && { socialLinks: JSON.parse(socialLinks) }),
          ...(isActive    !== undefined && { isActive }),
        },
      });
      return Response.success(res, member, 'Team member updated successfully');
    } catch (error) { next(error); }
  }

  static async deleteTeamMember(req, res, next) {
    try {
      await prisma.teamMember.delete({ where: { id: req.params.id } });
      return Response.success(res, null, 'Team member deleted successfully');
    } catch (error) { next(error); }
  }
}

module.exports = TeamController;
