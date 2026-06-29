const Response = require('../utils/response');
const prisma = require('../config/database');

class SettingsController {
  static async getSettings(req, res, next) {
    try {
      let settings = await prisma.setting.findFirst();

      if (!settings) {
        settings = await prisma.setting.create({
          data: {
            storeName: 'My Store',
            phone: '',
            address: '',
            logo: '',
          },
        });
      }

      return Response.success(res, settings, 'Settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const { storeName, phone, address, logo } = req.body;

      let settings = await prisma.setting.findFirst();

      if (!settings) {
        settings = await prisma.setting.create({
          data: {
            storeName,
            phone,
            address,
            logo,
          },
        });
      } else {
        settings = await prisma.setting.update({
          where: { id: settings.id },
          data: {
            storeName,
            phone,
            address,
            logo,
          },
        });
      }

      return Response.success(res, settings, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettingsController;
