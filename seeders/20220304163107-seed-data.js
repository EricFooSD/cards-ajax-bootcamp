module.exports = {
  async up(queryInterface, Sequelize) {
    const user = [
      {
        name: 'Eric',
        email: 'testing@gmail.com',
        password: 'testing',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Harry Potter',
        email: 'great@gmail.com',
        password: 'testing',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('users', user);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', null, {});
  },
};
