'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { TEST_DATABASE_URL } = require('../config');
const { dbConnect, dbDisconnect } = require('../db-mongoose');
const User = require('../models/question');

const expect = chai.expect;
chai.use(chaiHttp);

describe('WHAT DO YOU MEME API - Questions', function () {
    const img_url = 'https://i.imgur.com/bYlZr3J.jpg';
    const answer = 'confession bear';


    before(function () {
      return mongoose.connect(TEST_DATABASE_URL)
        .then(() => mongoose.connection.db.dropDatabase());
    });

    beforeEach(function () {
       User.ensureIndexes();
    });

    afterEach(function () {
        return mongoose.connection.db.dropDatabase();
    });

    after(function () {
        return mongoose.disconnect();
    });

    describe('/api/question', function () {
        describe('GET', function () {
            it('should return a question', function() {
                const user = User.findOne({user:user.username})
                return chai.request(app)
                .get('/api/question')
                .set('Authorization', `Bearer ${token}`)
                .then(res => {
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('object');
                    expect(res).to.havbe.status(200);
                })
            })
        })        
    })

})
