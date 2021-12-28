const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Users = require('../model/users.model');

module.exports = (passport) => {
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
    opts.secretOrKey = process.env.PASSPORT_SECRET;

    passport.use('api-auth', new JwtStrategy(opts, (jwt_payload, done) => {
        Users.getUserById(jwt_payload._id, (err, user) => {
            if(err) {
                return done(err, false);
            }
            
            if(user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
    

}