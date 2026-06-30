const bcrypt = require('bcryptjs');

class Bcrypt {
  static async hash(password) {
    return await bcrypt.hash(password, 10);
  }

  static async compare(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = Bcrypt;
