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
      // define association here
    }

    static async overdueCount() {
      const today = new Date().toISOString().split("T")[0];
      return await this.count({
        where: {
          dueDate: { [Op.lt]: today },
        },
      });
    }

    static async dueTodayCount() {
      const today = new Date().toISOString().split("T")[0];
      return await this.count({
        where: {
          dueDate: today,
        },
      });
    }

    static async dueLaterCount() {
      const today = new Date().toISOString().split("T")[0];
      return await this.count({
        where: {
          dueDate: { [Op.gt]: today },
        },
      });
    }

    static getAllTodos() {
      return this.findAll({
        order: [["dueDate", "ASC"]],
      });
    }

    static addTodo({ title, dueDate }) {
      return this.create({
        title: title,
        dueDate: dueDate,
        completed: false,
      });
    }

    async markAsCompleted() {
      return await this.update({ completed: true });
    }

    static async remove(id) {
      return await this.destroy({
        where: {
          id,
        },
      });
    }

    async deleteTodo() {
      return await this.destroy();
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );
  return Todo;
};
