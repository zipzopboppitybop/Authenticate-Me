'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'SpotImages';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        url: "hello",
        preview: true
      },
      {
        spotId: 1,
        url: "hello",
        preview: true
      },
      {
        spotId: 2,
        url: "hello",
        preview: false
      },
      {
        spotId: 2,
        url: "hello",
        preview: true
      },
      {
        spotId: 3,
        url: "hello",
        preview: true
      },
      {
        spotId: 3,
        url: "hello",
        preview: true
      },
      {
        spotId: 4,
        url: "hello",
        preview: true
      },
      {
        spotId: 4,
        url: "hello",
        preview: false
      },
      {
        spotId: 5,
        url: "hello",
        preview: false
      },
      {
        spotId: 5,
        url: "hello",
        preview: true
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {

    }, {});
  }
};
