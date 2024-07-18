const { DataTypes } = require('sequelize');

class User extends Entity {
  static init(sequelize) {
    super.init({
      name: DataTypes.STRING,
      cpf: DataTypes.STRING,
      email: DataTypes.STRING,
      birthday: DataTypes.STRING,
      gender: DataTypes.STRING,
      zipcode: DataTypes.STRING,
      public_place: DataTypes.STRING,
      number: DataTypes.INTEGER,
      neighborhood: DataTypes.STRING,
      city: DataTypes.STRING,
      uf: DataTypes.STRING,
      phone_number: DataTypes.STRING,
      password: DataTypes.STRING,
      registration_code: DataTypes.INTEGER,
    }, {
      sequelize,
    });
  };
}

module.exports = User;