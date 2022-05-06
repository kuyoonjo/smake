class Test {
  constructor(id) {
    this.id = id;
  }
  async generateCommands(_first, _last) {
    return [{
      label: `build ${this.id}`,
      command: async _ => {
        await new Promise(r => setTimeout(r, 1000));
      }
    }];
  }
}

module.exports = [
  new Test('test1'),
  {
    name: 'group1',
    targets: [
      new Test('test11'),
      new Test('test12'),
      {
        name: 'group2',
        targets: [
          new Test('test21'),
          new Test('test22'),
        ]
      }
    ]
  },
  new Test('test2'),
];