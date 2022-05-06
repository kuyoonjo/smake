class Test {
  constructor(id) {
    this.id = id;
  }
  async generateCommands(_first, _last) {
    return [1, 2, 3].map(x => ({
      label: `build test ${x}`,
      command: async opt => {
        await new Promise(r => setTimeout(r, 1000));
      }
    }));
  }
}

module.exports = [
  new Test('test'),
];