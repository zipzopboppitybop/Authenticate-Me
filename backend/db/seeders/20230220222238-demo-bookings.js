'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        userId: 1,
        startDate: new Date(),
        endDate: new Date(),
      },
      {
        spotId: 4,
        userId: 1,
        startDate: new Date(),
        endDate: new Date(),
      },
      {
        spotId: 5,
        userId: 1,
        startDate: new Date(),
        endDate: new Date(),
      },
      {
        spotId: 2,
        userId: 2,
        startDate: new Date(),
        endDate: new Date(),
      },
      {
        spotId: 3,
        userId: 3,
        startDate: new Date(),
        endDate: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Bookings';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {

    }, {});
  }
};
