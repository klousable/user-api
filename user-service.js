const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

let mongoDBConnectionString = `${process.env.MONGO_URL}`;
let Schema = mongoose.Schema;

let userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  favourites: [String],
  history: [String],
});

let User;

module.exports.connect = function () {
  return new Promise(function (resolve, reject) {
    mongoose
      .connect(mongoDBConnectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        User = mongoose.model("users", userSchema);
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password != userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt
        .hash(userData.password, 10)
        .then((hash) => {
          userData.password = hash;

          let newUser = new User(userData);

          newUser
            .save()
            .then(() => {
              resolve("User " + userData.userName + " successfully registered");
            })
            .catch((err) => {
              if (err.code == 11000) {
                reject("User Name already taken");
              } else {
                reject("There was an error creating the user: " + err);
              }
            });
        })
        .catch((err) => reject(err));
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise(function (resolve, reject) {
    User.findOne({ userName: userData.userName })
      .exec()
      .then((user) => {
        bcrypt.compare(userData.password, user.password).then((res) => {
          if (res === true) {
            resolve(user);
          } else {
            reject("Incorrect password for user " + userData.userName);
          }
        });
      })
      .catch((err) => {
        reject("Unable to find user " + userData.userName);
      });
  });
};

module.exports.getFavourites = function (id) {
  return new Promise(function (resolve, reject) {
    User.findById(id)
      .exec()
      .then((user) => {
        resolve({
          favourites: user.favourites,
        });
      })
      .catch((err) => {
        reject({
          message: `Unable to get favourites for user with id: ${id}`,
          error: err,
        });
      });
  });
};

module.exports.getUserById = function (id) {
  return new Promise((resolve, reject) => {
    User.findById(id)
      .exec()
      .then((user) => {
        if (user) {
          resolve(user);
        } else {
          reject(`No user found with ID: ${id}`);
        }
      })
      .catch((err) => {
        reject(`Error fetching user by ID: ${err}`);
      });
  });
};

module.exports.addFavourite = function (id, favId) {
  return new Promise(function (resolve, reject) {
    User.findById(id)
      .exec()
      .then((user) => {
        if (user.favourites.length < 50) {
          User.findByIdAndUpdate(
            id,
            { $addToSet: { favourites: favId } },
            { new: true }
          )
            .exec()
            .then((user) => {
              resolve(user.favourites);
            })
            .catch((err) => {
              reject(`Unable to update favourites for user with id: ${id}`);
            });
        } else {
          reject(`Unable to update favourites for user with id: ${id}`);
        }
      });
  });
};

module.exports.removeFavourite = function (id, favId) {
  return new Promise(function (resolve, reject) {
    User.findByIdAndUpdate(id, { $pull: { favourites: favId } }, { new: true })
      .exec()
      .then((user) => {
        resolve(user.favourites);
      })
      .catch((err) => {
        reject(`Unable to update favourites for user with id: ${id}`);
      });
  });
};

module.exports.getHistory = function (id) {
  return new Promise(function (resolve, reject) {
    User.findById(id)
      .exec()
      .then((user) => {
        resolve({
          history: user.history,
        });
      })
      .catch((err) => {
        reject({
          message: `Unable to get history for user with id: ${id}`,
          error: err,
        });
      });
  });
};

module.exports.addHistory = function (id, historyId) {
  return new Promise(function (resolve, reject) {
    User.findById(id)
      .exec()
      .then((user) => {
        if (user.favourites.length < 50) {
          User.findByIdAndUpdate(
            id,
            { $addToSet: { history: historyId } },
            { new: true }
          )
            .exec()
            .then((user) => {
              resolve(user.history);
            })
            .catch((err) => {
              reject(`Unable to update history for user with id: ${id}`);
            });
        } else {
          reject(`Unable to update history for user with id: ${id}`);
        }
      });
  });
};

module.exports.removeHistory = function (id, historyId) {
  return new Promise(function (resolve, reject) {
    User.findByIdAndUpdate(id, { $pull: { history: historyId } }, { new: true })
      .exec()
      .then((user) => {
        resolve(user.history);
      })
      .catch((err) => {
        reject(`Unable to update history for user with id: ${id}`);
      });
  });
};
