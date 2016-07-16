'use strict';
const Install         = require('./class/Install');
const User            = require('./class/User');
const Gallery         = require('./class/Gallery');
const GalleryActivity = require('./class/GalleryActivity');
const GalleryComment  = require('./class/GalleryComment');
const Installation    = require('./class/Installation');
const Dashboard       = require('./class/Dashboard');


// Instalattion
//Parse.Cloud.beforeSave(Installation.beforeSave);

// Install
Parse.Cloud.define('status', Install.status);
Parse.Cloud.define('install', Install.start);

// Admin Dashboard
Parse.Cloud.define('dashboard', Dashboard.home)

// GalleryActivity
Parse.Cloud.define('feedActivity', GalleryActivity.feed);

// User
Parse.Cloud.beforeSave(Parse.User, User.beforeSave);
Parse.Cloud.afterSave(Parse.User, User.afterSave);
//Parse.Cloud.afterDelete(Parse.User, User.afterDelete);

Parse.Cloud.define('findUserByUsername', User.findUserByUsername);
Parse.Cloud.define('findUserByEmail', User.findUserByEmail);
Parse.Cloud.define('profile', User.profile);
Parse.Cloud.define('followUser', User.follow);
Parse.Cloud.define('getLikers', User.getLikers);
Parse.Cloud.define('getFollowers', User.getFollowers);
Parse.Cloud.define('getFollowing', User.getFollowing);
Parse.Cloud.define('getUsers', User.getUsers);
Parse.Cloud.define('listUsers', User.listUsers);
Parse.Cloud.define('createUser', User.createUser);
Parse.Cloud.define('updateUser', User.updateUser);
Parse.Cloud.define('destroyUser', User.destroyUser);
Parse.Cloud.define('saveFacebookPicture', User.saveFacebookPicture);
Parse.Cloud.define('validateUsername', User.validateUsername);
Parse.Cloud.define('validateEmail', User.validateEmail);

// Gallery
Parse.Cloud.beforeSave('Gallery', Gallery.beforeSave);
Parse.Cloud.afterSave('Gallery', Gallery.afterSave);
Parse.Cloud.afterDelete('Gallery', Gallery.afterDelete);
Parse.Cloud.define('feedGallery', Gallery.feed);
Parse.Cloud.define('commentGallery', Gallery.commentGallery);
Parse.Cloud.define('likeGallery', Gallery.likeGallery);
Parse.Cloud.define('isGalleryLiked', Gallery.isGalleryLiked);

// GalleryComment
Parse.Cloud.beforeSave('GalleryComment', GalleryComment.beforeSave);
Parse.Cloud.afterSave('GalleryComment', GalleryComment.afterSave);

// PUsh
Parse.Cloud.define('verifyServerConnection', (req, res) => {
    console.log('Parse.Cloud: verifyServerConnection. installationId ---' + req.installationId.slice(-5));
    res.success({
        status: "a okay",
        ts    : Date.now()
    });
});

function _sendPushToAll(data, res, delayMs) {
    console.log('Parse.Push data: ' + JSON.stringify(data));

    //
    // timeout is useful for testing coldstart pn with only 1 device
    //
    setTimeout(function () {
        var query = new Parse.Query(Parse.Installation);
        Parse.Push.send({
            where: query,
            data : data,
        }, {useMasterKey: true})
             .then(function () {
                 console.log('push sent. args received: ' + JSON.stringify(arguments) + '\n');
                 res.success({
                     status: 'push sent',
                     ts    : Date.now()
                 });
             }, function (error) {
                 console.log('push failed. ' + JSON.stringify(error) + '\n');
                 res.error(error);
             });
    }, delayMs);
}

Parse.Cloud.define('pushText', (req, res) => {
    let data = {
        alert: req.params.textMsg || "Hello from your Parse Server"
    };
    _sendPushToAll(data, res, req.params.delayMs || 0);
});

Parse.Cloud.define('pushChat', (req, res) => {
    //setting the 'event' key will trigger receivePN:chat on the client
    let data = {
        alert: req.params.textMsg || "Chat msg from your Parse Server",
        event: 'chat'
    };

    _sendPushToAll(data, res, req.params.delayMs || 0);
})



