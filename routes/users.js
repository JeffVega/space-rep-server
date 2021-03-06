'use strict';
const express = require('express');

const passport = require('passport');
// const { Strategy: LocalStrategy } = require('passport-local');

const router = express.Router();
 
const User = require('../models/user');
const Ques = require('../models/question')
const LinkedList = require('../linked-list/linked-list')
//  const question  = require('../db/seed/questions.json')

router.post('/users', (req, res, next) => {

  
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  // User.question.map(question => new Node(question))
  
  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password', 'fullname'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    const err = new Error(`Field: '${nonStringField}' must be type String`);
    err.status = 422;
    return next(err);
  }

  
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(`Field: '${nonTrimmedField}' cannot start or end with whitespace`);
    err.status = 422;
    return next(err);
  }


  const sizedFields = {
    username: { min: 1 },
    password: { min: 5, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field => 'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    return next(err);
  }

  const tooLargeField = Object.keys(sizedFields).find(
    field => 'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(`Field: '${tooSmallField}' must be at most ${max} characters long`);
    err.status = 422;
    return next(err);
  }

  let { username, password, fullname = '' } = req.body;
  fullname = fullname.trim();
  
  return User.hashPassword(password)
    .then(digest => {
      return Ques.find({})
      .then(results =>{

        const newUser = {
          fullname,
          username,
          questions: results,
          password: digest
        };
        return User.create(newUser)
      })
     
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.id}`).json(result) 
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.get('/users', passport.authenticate('jwt', {session:false}), (req, res, next) => {
  const userId = req.user.id;

  User.findById(userId)
    .populate('question')
    .then( user => {
      res.json(user);
    })
    .catch(err => next);
});




//if correct memory set to multiply by 2
// else reset to 1

// router.post('/users/:id', (req, res, next) => {
//   const id = req.params.id;
//   //get files represented in users 
// })

// router.post('/users/:id/question', (req, res) => {
//   req.body.answer 
//   if (req.body.answer ===  ) {
//     //
//   }
//   //id of current question their on compared to question model
//   //User.findById()
//   //compare to see if answer is correct -> call method from linked list class
//   //or have algorithim here, if right move it to back with ali's array (M value)
//   //if wrong move one 
// })



module.exports = router;

