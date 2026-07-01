/**
 * CVPro Studio — Settings Controller
 * Manages business settings including payment account details.
 */
const Response = require('../utils/response');
const prisma = require('../config/database');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

const DEFAULT_SETTINGS = {
  id: 'default',
  businessName: 'CVPro Studio',
  ownerName: 'Indri Ariska',
  phone: '+62 83830094365',
  whatsapp: '6283122172584',
  email: 'indriariska469@gmail.com',
  address: 'Indonesia',
  instagram: 'ftryy.z.a_',
};

class SettingsController {
  static async getSettings(req, res, next) {
    try {
      let settings = await prisma.setting.findFirst();
      if (!settings) {
        settings = await prisma.setting.create({ data: DEFAULT_SETTINGS });
      }
      return Response.success(res, settings, 'Settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const {
        businessName, ownerName, phone, whatsapp, email, address, instagram,
        paymentBca, paymentBsi, paymentBri, paymentMandiri, paymentDana, paymentGopay,
      } = req.body;

      // Upload logo to Cloudinary if provided
      let logo = undefined;
      if (req.file && req.file.buffer) {
        logo = await uploadToCloudinary(req.file.buffer, 'cvpro-studio/logos');
      }

      const data = {};
      if (businessName   !== undefined) data.businessName   = businessName;
      if (ownerName      !== undefined) data.ownerName      = ownerName;
      if (phone          !== undefined) data.phone          = phone;
      if (whatsapp       !== undefined) data.whatsapp       = whatsapp;
      if (email          !== undefined) data.email          = email;
      if (address        !== undefined) data.address        = address;
      if (instagram      !== undefined) data.instagram      = instagram;
      if (logo           !== undefined) data.logo           = logo;
      if (paymentBca     !== undefined) data.paymentBca     = paymentBca;
      if (paymentBsi     !== undefined) data.paymentBsi     = paymentBsi;
      if (paymentBri     !== undefined) data.paymentBri     = paymentBri;
      if (paymentMandiri !== undefined) data.paymentMandiri = paymentMandiri;
      if (paymentDana    !== undefined) data.paymentDana    = paymentDana;
      if (paymentGopay   !== undefined) data.paymentGopay   = paymentGopay;

      let settings = await prisma.setting.findFirst();
      if (!settings) {
        settings = await prisma.setting.create({ data: { ...DEFAULT_SETTINGS, ...data } });
      } else {
        settings = await prisma.setting.update({ where: { id: settings.id }, data });
      }

      return Response.success(res, settings, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SettingsController;
