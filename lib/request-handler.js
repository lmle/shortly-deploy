var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  })
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  console.log('uri in saveLink:', uri);

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  console.log('WERE HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE');

  Link.find({ url: uri }).exec(function(err, links) {
    // if(links) {
    //   console.log('links:', links);
    //   res.send(200, links);
    //   return;
    // }

    util.getUrlTitle(uri, function(err, title){

      if(err){
        console.log('Error readding URL heading: ', err);
        return res.send(404);
      }

      var link = new Link({
        url: uri,
        title: title,
        base_url: req.headers.origin
      });
      console.log('created new link? :', link);

      link.save(function(err, newLink){
        console.log('newLink:', newLink);
        if(err) {
          console.log('Error in link.save');
          return;
        }

        res.send(200, newLink);
      });

    });

  });

  // new Link({ url: uri }).fetch().then(function(found) {
  //   if (found) {
  //     res.send(200, found.attributes);
  //   } else {
  //     util.getUrlTitle(uri, function(err, title) {
  //       if (err) {
  //         console.log('Error reading URL heading: ', err);
  //         return res.send(404);
  //       }

  //       var link = new Link({
  //         url: uri,
  //         title: title,
  //         base_url: req.headers.origin
  //       });

  //       link.save().then(function(newLink) {
  //         Links.add(newLink);
  //         res.send(200, newLink);
  //       });
  //     });
  //   }
  // });


};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }).exec(function(err, users){
    if(!users){
      res.redirect('/login');
      return;
    }

    users.comparePassword(password, function(match){
      if(match){
        util.createSession(req, res, user);
        return;
      }

      res.redirect('/login');

    });

  });


  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       res.redirect('/login');
  //     } else {
  //       user.comparePassword(password, function(match) {
  //         if (match) {
  //           util.createSession(req, res, user);
  //         } else {
  //           res.redirect('/login');
  //         }
  //       })
  //     }
  // });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }).exec(function(err, users) {
    if(users) {
      console.log('Account already exists!');
      res.redirect('/signup');
    }

    var newUser = new User({
      username: username,
      password: password
    });

    newUser.save(function(err, newUser) {
      util.createSession(req, res, newUser);
    });
  });

  // new User({ username: username })
  //   .fetch()
  //   .then(function(user) {
  //     if (!user) {
  //       var newUser = new User({
  //         username: username,
  //         password: password
  //       });
  //       newUser.save()
  //         .then(function(newUser) {
  //           util.createSession(req, res, newUser);
  //           Users.add(newUser);
  //         });
  //     } else {
  //       console.log('Account already exists');
  //       res.redirect('/signup');
  //     }
  //   })
};

exports.navToLink = function(req, res) {
  Link.find({ code: req.params[0] }).exec(function(err, link) {
    if(!link) {
      res.redirect('/');
      return;
    }

    link.visits = link.visits + 1;
    return res.redirect(link.url);
  });
  // new Link({ code: req.params[0] }).fetch().then(function(link) {
  //   if (!link) {
  //     res.redirect('/');
  //   } else {
  //     link.set({ visits: link.get('visits') + 1 })
  //       .save()
  //       .then(function() {
  //         return res.redirect(link.get('url'));
  //       });
  //   }
  // });
};
