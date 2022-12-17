#! /usr/bin/env node

console.log('This script populates some test records and genresto your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
console.log(userArgs[0]);
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {dbName: `records_inventory`,useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var records = []
var genres = []

function itemCreate(title, artist, description, format, release, rating, price, quantity, genre, cb) {
  itemdetail = {title:title , artist:artist, description:description, format:format, release:release, rating:rating, price:price, quantity:quantity}
  if (genre != false) itemdetail.genre = genre
  
  var item = new Item(itemdetail);
       
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    records.push(item)
    cb(null, item)
  }  );
}

function categoryCreate(name, description, cb) {
  var category = new Category({ name: name, description:description });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    genres.push(category)
    cb(null, category);
  }   );
}

function createRecordData(cb) {
    async.series([
        //genres
        function(callback) {
            categoryCreate("Hip Hop", "Hip hop music, also called hip-hop, rap music, or hip-hop music, is a music genre consisting of a stylized rhythmic music that commonly accompanies rapping, a rhythmic and rhyming speech that is chanted. It developed as part of hip hop culture, a subculture defined by four key stylistic elements: MCing/rapping, DJing/scratching, break dancing, and graffiti writing.", callback);
        },
        function(callback) {
            categoryCreate("Funk", "Funk is a music genre that originated in the mid to late 1960s when African-American musicians created a rhythmic, danceable new form of music through a mixture of soul music, jazz, and R&B. Funk de-emphasizes melody and harmony and brings a strong rhythmic groove of electric bass and drums to the foreground. Funk songs are often based on an extended vamp on a single chord, distinguishing them from R&B and soul songs, which are built on chord progressions.", callback);
        },
        function(callback) {
            categoryCreate("Alternative Rock", "Alternative rock (also called alternative music, alt-rock or simply alternative) is a genre of rock music that emerged from the independent music underground of the 1980s and became widely popular by the 1990s. The alternative definition refers to the genre's distinction from mainstream rock music, expressed primarily in a distorted guitar sound, subversive and/or transgressive lyrics and generally a nonchalant, defiant attitude. ", callback);
        },
        //records
        function(callback) {
            itemCreate('Aquemini', 'Outkast', "Aquemini is the third studio album by American hip hop duo Outkast. It was released on September 29, 1998, by LaFace Records. The title is a portmanteau of the two performers' Zodiac signs: Aquarius (Big Boi) and Gemini (André 3000), which is indicative of the album's recurring theme of the differing personalities of the two members. The group recorded the majority of the album in Bobby Brown's Bosstown Recording Studios and Doppler Studios, both in Atlanta, Georgia.", "3 x Vinyl, LP, Album, Reissue", "1998", 4.64, 33.95, 41, genres[0], callback);
        },
        function(callback) {
            itemCreate('ATLiens', 'Outkast', "ATLiens is the second studio album by American hip hop duo Outkast. It was released on August 27, 1996, by Arista Records and LaFace Records. From 1995 to 1996, Outkast recorded ATLiens in sessions at several Atlanta studios. The record features outer space-inspired production sounds, with Outkast and producers Organized Noize incorporating elements of dub and gospel into the compositions. ", "2 x Vinyl, LP, Album, Reissue", "1996", 4.69, 29.95, 14, genres[0], callback);
        },
        function(callback) {
            itemCreate('Songs In The Key Of Life', 'Stevie Wonder', "Songs in the Key of Life is the eighteenth studio album by American singer, songwriter and musician Stevie Wonder. A double album, it was released on September 28, 1976, by Tamla Records, a division of Motown. The album has been regarded by music journalists as the culmination of Wonder's classic period of recording. It debuted at number one on the Billboard Pop Albums Chart, becoming only the third album to achieve that feat, and the first by an American artist.", "2 x Vinyl, LP, Waddell Press", "1976", 4.36, 27.00, 6, genres[1], callback);
        },
        function(callback) {
            itemCreate('Joy In The Wild Unknown', 'Ripe', "Ripe’s debut LP celebrates looking inward and, truly, finding joy in the Wild Unknown. Aptly named, the LP strikes a balance between uncertainty and hopefulness. The lyrics often express wariness but comfort at the same time.", "2 x Vinyl, LP, Album, Stereo", "2018", 4.74, 25.00, 12, genres[1], callback);
        },
        function(callback) {
            itemCreate('AM', 'Artic Monkeys', "AM is the fifth studio album by English rock band Arctic Monkeys. It was produced by James Ford and co-produced by Ross Orton at Sage & Sound Recording in Los Angeles and Rancho De La Luna in Joshua Tree, California. Drawing inspiration from a wide range of genres, including psychedelic rock, blues rock, hard rock, heavy metal, R&B, and soul, AM has become one of Arctic Monkeys' most successful albums to date, topping charts in several countries, and reaching top ten positions in many more. ", "Vinyl, LP, Album, 180 Gram, Gatefold", "2013", 4.43, 22.50, 3, genres[2], callback);
        },
        ],
        // optional callback
        cb);
}

async.series([
    createRecordData,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});