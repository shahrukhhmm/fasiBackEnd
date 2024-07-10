const Song = require('../models/song');
const uploadSong = require('../utils/uploadSong')
const songService = {
    create: async (songName, music, singerName, category, thumbnail) => {

        const dup = await Song.findOne({ songName: songName });
        if (dup) {
            throw new Error("Song already Exists");
        }
        const Song = await uploadSong(music)
        let newSong = new Song({
            songName: songName,
            song: music,
            singerName: singerName,
            category: category,
            thumbnail: thumbnail
        })

        const createdSong = await newSong.save();

        return createdSong;
    },
    getAll: async () => {
        const users = await Song.find();
        if (!users) {
            return { statusCode: 500, message: "Error retrieving data" };
        } else {
            return users;
        }
    },
    getById: async (id) => {
        const userRecord = await Song.find({ _id: id });
        if (!userRecord) {
            return { statusCode: 404, message: "No User found with the given id" };
        } else {
            return userRecord;
        }
    },
};

module.exports = songService;
