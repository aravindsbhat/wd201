"use strict";
const { Model, Op } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    // eslint-disable-next-line no-unused-vars
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }

    static async overdue(userId) {
      const today = new Date().toISOString().split("T")[0];
      return await this.findAll({
        where: {
          completed: false,
          dueDate: { [Op.lt]: today },
          userId,
        },
      });
    }

    static async dueToday(userId) {
      const today = new Date().toISOString().split("T")[0];
      return await this.findAll({
        where: {
          completed: false,
          dueDate: today,
          userId,
        },
      });
    }

    static async dueLater(userId) {
      const today = new Date().toISOString().split("T")[0];
      return await this.findAll({
        where: {
          completed: false,
          dueDate: { [Op.gt]: today },
          userId,
        },
      });
    }

    static async completed(userId) {
      return await this.findAll({
        where: { completed: true, userId },
      });
    }

    static getAllTodos() {
      return this.findAll({
        order: [["dueDate", "ASC"]],
      });
    }

    static addTodo({ title, dueDate, userId }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
        userId,
      });
    }

    async setCompletionStatus(comp) {
      return await this.update({ completed: comp });
    }

    static async remove(id, userId) {
      return await this.destroy({
        where: {
          id,
          userId,
        },
      });
    }

    async deleteTodo() {
      return await this.destroy();
    }
  }
  Todo.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: true,
          len: 5,
        },
      },
      dueDate: DataTypes.DATEONLY,
      completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );
  return Todo;
};
