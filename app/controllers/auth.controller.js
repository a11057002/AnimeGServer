const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const Visit = db.visit;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var tokenList = [];

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles }
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map(role => role._id);
          user.save(err => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            res.send({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save(err => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          res.send({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = async (req, res) => {
  _addVisit()
  const visits = await _visit()
  User.findOne({
    username: req.body.username
  })
    .populate("roles", "-__v")
    .exec((err, user) => {

      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, 
      //   {
      //   expiresIn: 86400 // 24 hours
      // }
      );
      var refreshToken = jwt.sign({ id: user.id }, config.refreshSecret, {
        expiresIn: 86400 // 24 hours
      });
      tokenList.push(refreshToken)

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      console.log(user._id)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send({
        id: user._id,
        name: user.username,
        email: user.email,
        roles: authorities,
        token: token,
        refreshToken: refreshToken,
        visits: visits
      });
    });
};

exports.refreshToken = (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken === null) {
    return res.status(401).send({
      token: null,
      message: "refreshToken can't be null"
    });
  }
  if (!tokenList.includes(refreshToken)) {
    return res.status(401).send({
      token: null,
      message: "refreshToken is invalid"
    });
  }
  jwt.verify(refreshToken, config.refreshSecret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        token: null,
        message: "refreshToken is invalid"
      });
    }
    const id = decoded.id;
    User.findById(id, (err, user) => {
      if (err) {
        return res.status(500).send({ message: err });
      }
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });
      res.status(200).send({
        token: token
      });
    });
  });
}

exports.getVisits = async (req, res) => {
  count = await _visit()
  res.status(200).send({ "visits": count });
}

const _visit = () => {
  return new Promise((resolve, reject) => {
    Visit.findOne({
      title: "visit"
    }).exec((err, visit) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!visit) {
        const v = new Visit({
          title: "visit",
          count: 0
        })
        v.save((err, visit) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          resolve(visit.count)
        })
      }
      console.log(visit.count)
      resolve(visit.count)
    })
  })
}

const _addVisit = () => {
  Visit.findOne({
    title: "visit"
  }).exec((err, visit) => {
    visit.count++
    visit.save()
  })
}
