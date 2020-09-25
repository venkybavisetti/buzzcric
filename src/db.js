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

  addUser({ id, name, img }) {
    return new Promise((resolve, reject) => {
      this.client.hmset(id, { id, name, img }, (err, res) => {
        resolve(true);
      });
    });
  }

  getUser(id) {
    return new Promise((resolve, reject) => {
      this.client.hgetall(id, (err, res) => {
        if (err) resolve({});
        resolve(res);
      });
    });
  }
}

module.exports = { DB };
