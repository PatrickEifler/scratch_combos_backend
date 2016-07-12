'use strict';
const L = require('lodash');

module.exports = (sequelize, DataTypes) => {
  let combos = sequelize.define('combos', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true
      },
      scratches: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
      },
      difficulty: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      isDone: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        set: function (val) {
            this.setDataValue('isDone', val);
        },
        get: function() {
            return this.getDataValue('isDone');
        }
      }
    },
    {
      instanceMethods: {
        updateDoneFlag: function() {
          let _isDone = this.endTime !== null;
          this.update({ isDone: _isDone });
          return this;
        },
        cleanUpForExternals: function() {
          return L.omit(this.dataValues, ['createdAt', 'updatedAt']);
        }
      }
    }
  );

  return combos;
};
