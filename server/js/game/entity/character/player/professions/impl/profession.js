class Profession {
  constructor(id) {
    const self = this;

    self.id = id;

    self.experience = 0;
  }

  load(data) {
    this.experience = data.experience;
  }

  getData() {
    return {
      experience: this.experience
    };
  }
}

module.exports = Profession;
