const express = require ('express');
const router = express.Router();
const bcrypt = require ('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
//Item Model
const User = require ('../../models/User');

//@route    post api/users
//@desc     Register New users
//@access   Public
router.post ('/', (req, res) => {
  const {name, email, password} = req.body;

  //simple validation

  if (!name || !email || !password) {
    return res.status (400).json ({msg: 'Please fill all fields'});
  }

  User.findOne ({email}).then (user => {
    if (user) return res.status (400).json ({msg: 'User already exists'});
    const newUser = new User ({
      name,
      email,
      password,
    });

    //Create salt & hash
    bcrypt.genSalt (10, (err, salt) => {
      bcrypt.hash (newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save ().then (user => {
            jwt.sign(
                {id: user.id}, //Payload, to verify the exact user id has access to ceertain thing
                config.get('jwtSecret'), //
                {expiresIn: 3600}, //
                (err, token) => {
                  if(err)  throw err;
                  res.json ({
                    token, 
                    user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    },
                });
                } //callback
            )
        });
      });
    });
  });
});

module.exports = router;
