const user = require('../models/users');
const Song = require('../models/song');
const bcrypt = require("bcrypt");
const UserDto = require("../dto/user");
const cloudinary = require('cloudinary').v2

const userService = {
    create: async(name, email, password) => {

        const dup = await user.findOne({ email: email });
        if (dup) {
            throw new Error("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        let newUser = new user({
            name: name,
            email: email,
            password: hashedPassword,
        });
        const createdUser = await newUser.save();

        return createdUser;
    },
    getAll: async() => {
        const users = await user.find();
        const usersWithDistinctSongs = [];

        for (let user of users) {

            const distinctCategories = await Song.distinct('category', { userId: user._id });

            const songsByCategory = [];
            for (let category of distinctCategories) {
                const songs = await Song.find({ userId: user._id, category }).sort({ createdAt: 'asc' });
                songsByCategory.push({
                    category,
                    // songs: songs.map(song => ({
                    //     _id: song._id,
                    //     name: song.name,
                    //     type: song.type,
                    //     author_name: song.author_name,
                    //     lang: song.lang,
                    //     musicName: song.musicName,
                    //     individual: song.individual,
                    //     img: song.img,
                    //     timesPlayed: song.timesPlayed,
                    //     attributes: song.attributes,
                    //     likes: song.likes,
                    //     comments: song.comments
                    // }))
                });
            }

            usersWithDistinctSongs.push({
                _id: user._id,
                name: user.name,
                email: user.email,
                password: user.password,
                followers: user.followers,
                following: user.following,
                tracks: user.tracks,
                createdAt: user.createdAt,
                profileImage: user.profileImage,
                profileCover: user.profileCover,
                bio: user.bio,
                location: user.location,
                songsByCategory
            });
        }

        return usersWithDistinctSongs;

    },
    getById: async(id) => {

        const userRecord = await user.findById({ _id: id });

        if (!userRecord) {
            return { statusCode: 404, message: "No User found with the given id" };
        } else {
            return userRecord;
        }
    },
    Login: async(email, password) => {
        const userFind = await user.findOne({ email: email });

        if (!userFind) {
            throw new Error("User is not Registered");
        }

        const passwordMatch = await bcrypt.compare(password, userFind.password || '');

        if (!passwordMatch) {
            throw new Error("Incorrect Password");
        }

        return userFind;
    },

    updateUser: async({ id, name, city, country, bio }) => {
        try {

            const existingUser = await user.find({ _id: id });

            if (!existingUser) {
                throw new Error('User not found')
            } else {

                //const result = await cloudinary.uploader.upload(profileUrl.path, { folder: 'Profiles' })

                const update = {
                    name,
                    bio,
                    location: {
                        city: city,
                        country: country
                    }
                }
                const updateUser = await user.findOneAndUpdate({ _id: id }, update)
                return updateUser;
            }
        } catch (error) {
            console.log(error)
        }


    },

    updateProfileImage: async({ id, imageFile }) => {

        try {

            console.log("id ==> ", id)
            const existingUser = await user.findById({ _id: id });

            console.log(existingUser)

            if (!existingUser) {
                throw new Error('User not found')
            } else {

                const result = await cloudinary.uploader.upload(imageFile.path, { folder: 'Profiles' })

                const newProfileImage = {
                    public_id: result.public_id,
                    profile_url: result.secure_url
                }

                const updateUser = await user.findOneAndUpdate({ _id: id }, { $set: { profileImage: newProfileImage } }, { new: true, useFindAndModify: false })

                console.log(updateUser)

                return updateUser;
            }
        } catch (error) {
            console.log(error)
        }

    },

    updateCoverImage: async({ id, imageFile }) => {

        try {

            const existingUser = await user.findById({ _id: id });

            if (!existingUser) {
                throw new Error('User not found')
            } else {

                const result = await cloudinary.uploader.upload(imageFile.path, { folder: 'Profiles' })

                const newCoverImage = {
                    public_id: result.public_id,
                    profile_url: result.secure_url
                }

                const updateUser = await user.findOneAndUpdate({ _id: id }, { $set: { profileCover: newCoverImage } }, { new: true, useFindAndModify: false })
                return updateUser;
            }
        } catch (error) {
            console.log(error)
        }

    },
};

module.exports = userService;