let local = {
  save(key, value) {  //存值操作
    localStorage.setItem(key, JSON.stringify(value));
  },
  fetch(key) {  //取值操作
    return JSON.parse(localStorage.getItem(key)) || {};
  }
}

module.exports = local
