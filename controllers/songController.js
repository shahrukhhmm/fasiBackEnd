const Song = require('../models/song');
const { v4: uuidv4 } = require('uuid');
const { bucket } = require('../config/firebase');

const create = async(req, res) => {
    try {
        const { userId, name, author_name, lang, type, attribution, category, individual } = req.body;
        const audioFile = req.files['audioFile'][0];
        const thumbnail = req.files['thumbnail'][0];

        if (!audioFile || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: 'Please upload both audio and thumbnail files'
            });
        }

        const audioFileName = `songs/${userId}/${uuidv4()}_${audioFile.originalname}`;
        const thumbnailFileName = `thumbnails/${userId}/${uuidv4()}_${thumbnail.originalname}`;

        const audioBlob = bucket.file(audioFileName);
        const thumbnailBlob = bucket.file(thumbnailFileName);

        const audioBlobStream = audioBlob.createWriteStream({
            metadata: {
                contentType: audioFile.mimetype
            }
        });

        const thumbnailBlobStream = thumbnailBlob.createWriteStream({
            metadata: {
                contentType: thumbnail.mimetype
            }
        });

        audioBlobStream.end(audioFile.buffer);
        thumbnailBlobStream.end(thumbnail.buffer);

        await new Promise((resolve, reject) => {
            audioBlobStream.on('finish', resolve);
            audioBlobStream.on('error', reject);
        });

        await new Promise((resolve, reject) => {
            thumbnailBlobStream.on('finish', resolve);
            thumbnailBlobStream.on('error', reject);
        });

        const audioUrl = `https://storage.googleapis.com/${bucket.name}/${audioFileName}`;
        const thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailFileName}`;

        const newSong = new Song({
            userId: userId,
            name: name,
            author_name: author_name,
            lang: lang,
            type: type,
            category: category,
            musicName: audioUrl,
            img: thumbnailUrl,
            timesPlayed: 0,
            individual: individual,
            attribution: {
                song: attribution.song,
                musicBy: attribution.musicBy
            },
            likes: [],
            comments: []
        });

        // Save the new song to the database
        const savedSong = await newSong.save();

        res.status(201).json({
            success: true,
            message: 'Song added successfully',
            song: savedSong
        });
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add the song',
            error: error.message
        });
    }
};



// Controller function to get all songs
const getAll = async(req, res) => {
    try {
        const songs = await Song.find();
        res.status(200).json({ songs });
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller function to get a song by ID
const getById = async(req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.status(200).json({ song });
    } catch (error) {
        console.error('Error fetching song by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller function to update a song
const update = async(req, res) => {
    try {
        const { id } = req.params;
        const updatedSong = await Song.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedSong) {
            return res.status(404).json({ error: 'Song not found' });
        }
        res.status(200).json({ message: 'Song updated successfully', song: updatedSong });
    } catch (error) {
        console.error('Error updating song:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller function to get songs by category
const getByCategory = async(req, res) => {
    try {
        const { category } = req.params;
        const songs = await Song.find({ category });
        res.status(200).json({ songs });
    } catch (error) {
        console.error('Error fetching songs by category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller function to get thumbnails by category
const getThumbnailsByCategory = async(req, res) => {
    try {
        const { category } = req.params;
        const songs = await Song.find({ category }).select('thumbnail');
        if (!songs || songs.length === 0) {
            return res.status(404).json({ message: 'No songs found for this category' });
        }
        const thumbnails = songs.map(song => song.thumbnail);
        res.status(200).json({ thumbnails });
    } catch (error) {
        console.error('Error fetching thumbnails by category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller function to add a like to a song
const addLike = async(req, res) => {
    const { userId, songId } = req.body;
    try {
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }
        if (song.likes.includes(userId)) {
            return res.status(400).json({ success: false, message: 'User has already liked the song' });
        }
        song.likes.push(userId);
        await song.save();
        res.status(200).json({ success: true, message: 'Like added successfully', song });
    } catch (error) {
        console.error('Error adding like to song:', error);
        res.status(500).json({ success: false, message: 'Failed to add like', error: error.message });
    }
};

// Remove a like from a song
const removeLike = async(req, res) => {
    const { userId, songId } = req.body;
    try {
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }
        if (!song.likes.includes(userId)) {
            return res.status(400).json({ success: false, message: 'User has not liked the song' });
        }
        song.likes = song.likes.filter(id => id.toString() !== userId);
        await song.save();
        res.status(200).json({ success: true, message: 'Like removed successfully', song });
    } catch (error) {
        console.error('Error removing like from song:', error);
        res.status(500).json({ success: false, message: 'Failed to remove like', error: error.message });
    }
};

// Controller function to add a comment to a song
const addComment = async(req, res) => {
    const { songId, userId, content } = req.body;
    try {
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }
        song.comments.push({ userId, content });
        await song.save();
        res.status(200).json({ success: true, message: 'Comment added successfully', song });
    } catch (error) {
        console.error('Error adding comment to song:', error);
        res.status(500).json({ success: false, message: 'Failed to add comment', error: error.message });
    }
};

// Controller function to get all liked songs
const getAllLikedSongs = async(req, res) => {

    const { userId } = req.params;
    try {
        const songs = await Song.find({ likes: userId });
        res.status(200).json({ songs });
    } catch (error) {
        console.error('Error fetching liked songs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getThumbnailById = async(req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        if (song.thumbnail) {
            const thumbnailPath = path.join(__dirname, '..', song.thumbnail);
            // Check if the thumbnail file exists
            if (fs.existsSync(thumbnailPath)) {
                // Send the thumbnail file as a response
                res.sendFile(thumbnailPath);
            } else {
                return res.status(404).json({ error: 'Thumbnail file not found for this song' });
            }
        } else {
            return res.status(404).json({ error: 'Thumbnail not found for this song' });
        }
    } catch (error) {
        console.error('Error fetching thumbnail by song ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getAudioById = async(req, res) => {
    try {
        const { id } = req.params;
        const song = await Song.findById(id);
        if (!song) {
            return res.status(404).json({ error: 'Song not found' });
        }
        if (song.music) {
            const audioPath = path.join(__dirname, '..', song.music);
            // Check if the audio file exists
            if (fs.existsSync(audioPath)) {
                // Send the audio file as a response
                res.sendFile(audioPath);
            } else {
                return res.status(404).json({ error: 'Audio file not found for this song' });
            }
        } else {
            return res.status(404).json({ error: 'Audio file not found for this song' });
        }
    } catch (error) {
        console.error('Error fetching audio by song ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const deleteComment = async(req, res) => {
    const { songId, commentId } = req.body;
    try {
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ success: false, message: 'Song not found' });
        }

        const commentIndex = song.comments.findIndex(comment => comment._id.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        song.comments.splice(commentIndex, 1);
        await song.save();

        res.status(200).json({ success: true, message: 'Comment deleted successfully', song });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, message: 'Failed to delete comment', error: error.message });
    }
};

module.exports = {
    create,
    getAll,
    getById,
    update,
    getByCategory,
    getThumbnailsByCategory,
    addLike,
    addComment,
    getAllLikedSongs,
    getThumbnailById,
    getAudioById,
    removeLike,
    deleteComment
};