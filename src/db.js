class DB {
  constructor(client) {
    this.client = client;
  }

  loadData() {
    return new Promise((resolve, reject) => {
      this.client.get('BuzzCric', (err, res) => resolve(JSON.parse(res)));
    });
  }

  saveData(BuzzCric) {
    return new Promise((resolve, reject) => {
      this.client.set('BuzzCric', JSON.stringify(BuzzCric), (err, res) =>
        resolve(true)
      );
    });
  }
}

module.exports = { DB };
