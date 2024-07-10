const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    dob: {
        type: Date,
    },
    profileCover: {
        public_id: {
            type: String,
        },
        profile_url: {
            type: String,
        }
    },
    profileImage: {
        public_id: {
            type: String,
        },
        profile_url: {
            type: String,
        }
    },
    location: {
        city: {
            type: String,
        },
        country: {
            type: String,
        }
    },
    bio: {
        type: String,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs for followers
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs for following
    tracks: {
        liked: {
            type: Number,
            default: 0,
        },
        playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }], // Array of Playlist IDs
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;