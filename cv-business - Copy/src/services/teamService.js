const prisma = require('../config/database');

class TeamService {
  static async findTeamMemberById(id) {
    return await prisma.teamMember.findUnique({
      where: { id },
    });
  }

  static async getActiveTeamMembers() {
    return await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = TeamService;
