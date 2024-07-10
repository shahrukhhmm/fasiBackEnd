const Joi = require('joi');
const userService = require('../services/userService');
const bcrypt = require("bcrypt");
const JwtService = require("../utils/JWTService");
const User = require('../models/users');
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const UserDto = require("../dto/user");
const { bucket } = require('../config/firebase');


const authController = {
    register: async(req, res, next) => {
        try {
            const registerSchema = Joi.object({
                name: Joi.string().min(5).max(20).required(),
                email: Joi.string().email().required(),
                password: Joi.string().pattern(passwordRegex).required(),
                confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
                category: Joi.string().optional(),
                //    password:req.body,
                //    confirmPassword:req.body
            });

            const { error } = registerSchema.validate(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            }

            const { name, email, password, confirmPassword } = req.body;
            const newUser = await userService.create(name, email, password, confirmPassword);

            if (newUser) {
                let Access = JwtService.generateUserSignedInAccessToken({ id: newUser._id, email: newUser.email }, '5m');
                let Refresh = JwtService.generateUserSignedInRefreshToken({ id: newUser._id, email: newUser.email }, '30m');
                if (!Access || !Refresh) {
                    throw Error;
                }
                // storing in db
                // await JwtService.storeRefreshToken(Refresh, newUser._id)

                // //sending Access token in cookiess
                // res.cookie('accesstoken', Access, {
                //     maxAge: 1000 * 60 * 60 * 24,
                //     httpOnly: true
                // });
                // //Sending Refresh token In cookiee
                // res.cookie('refreshtoken', Refresh, {
                //     maxAge: 1000 * 60 * 60 * 24,
                //     httpOnly: true
                // })
                // Handle success
                res.status(201).send({ message: 'User registered successfully', data: newUser, AccessToken: Access, RefreshToken: Refresh, auth: true });
            } else {
                // Handle failure
                res.status(500).send('User registration failed');
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    getAll: async(req, res, next) => {
        try {
            const allWithSongs = await userService.getAll()
            if (allWithSongs.length > 0) {
                res.status(200).send({ message: "All Data with First Songs", data: allWithSongs });
            } else {
                res.status(404).send({ message: "No users found" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    getById: async(req, res, next) => {
        try {
            const id = req.params.id;
            console.log('User id ==> ', id)

            const one = await userService.getById(id);
            if (one) {
                res.status(200).send({ message: "Record Found", data: one })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    Login: async(req, res) => {
        try {
            const LoginSchema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().pattern(passwordRegex).required(),
            });

            const { error } = LoginSchema.validate(req.body);

            if (error) {
                return res.status(400).send(error.details[0].message);
            }

            const { email, password } = req.body;

            const user = await userService.Login(email, password);

            if (user) {
                JwtService.sendToken(user, 200, req, res)
            } else {
                return res.status(400).send({ message: "Invalid Email or Password" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    },
    LogOut: async(req, res) => {
        try {
            const { authorization } = req.headers;
            if (!authorization) {
                return res.status(401).send({ message: "Unauthorized" });
            }

            const refreshToken = authorization;

            const deletedToken = await tokee.findOneAndUpdate({ token: refreshToken }, { $set: { token: null } }, );
            if (!deletedToken) {
                return res.status(400).send({ message: "Logout Failed!" })
            }
            // 2: Clear Headers
            res.setHeader('Authorization', '');

            // 3: Response
            return res.status(200).send({ message: "Logout Successfully", auth: false });
        } catch (error) {
            console.log(error);
            res.status(500).send(error.message);
        }
    },
    refresh: async(req, res, next) => {
        // 1. get refreshToken from cookies
        // 2. verify refreshToken
        // 3. generate new tokens
        // 4. update db, return response

        const { originalRefreshToken } = req.body;

        let id;

        try {
            id = JwtService.verifyRefreshToken(originalRefreshToken)._id;
        } catch (e) {
            const error = {
                status: 401,
                message: "Unauthorized",
            };

            res.status(401).send({ error });
        }

        try {
            const match = tokee.findOne({
                _id: id,
                token: originalRefreshToken,
            });

            if (!match) {
                const error = {
                    status: 401,
                    message: "Unauthorized",
                };

                return next(error);
            }
        } catch (e) {
            return next(e);
        }

        const accessToken = JwtService.signAccessToken({ _id: id }, "5m");

        const refreshToken = JwtService.signRefreshToken({ _id: id }, "30m");

        await tokee.updateOne({ _id: id }, { token: refreshToken });



        const user = await User.findOne({ _id: id }).select('-password -createdAt -updatedAt -__v');
        return res.status(200).json({
            user: user,
            AccessToken: accessToken,
            RefreshToken: refreshToken,
            auth: true
        });
    },

    updateProfile: async(req, res, next) => {

        try {
            const userId = req.params.userId
            const { name, city, country, bio } = req.body

            console.log(req.body)

            const data = {
                id: userId,
                name: name,
                city: city,
                country: country,
                bio: bio
            }

            const result = await userService.updateUser(data)

            if (result) {
                res.status(200).json({
                    success: true,
                    result
                })
            } else {
                res.status(401).json({
                    message: 'Failed to update the profile'
                })
            }

        } catch (error) {
            console.log(error)
        }
    },

    updateProfileImage: async(req, res, next) => {
        try {
            const userId = req.params.userId;
            const imageFile = req.file;

            if (!imageFile) {
                return res.status(401).json({
                    message: "Please upload the image",
                    success: false
                });
            }

            const blob = bucket.file(`profileImages/${userId}/${uuidv4()}_${imageFile.originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: imageFile.mimetype
                }
            });

            blobStream.on('error', (error) => {
                console.log(error);
                return res.status(500).json({
                    message: 'Failed to upload image',
                    success: false
                });
            });

            blobStream.on('finish', async() => {
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

                const result = await userService.updateProfileImage({ id: userId, imageUrl: publicUrl });

                if (result) {
                    return res.status(200).json({
                        message: 'Profile Image Updated Successfully',
                        success: true,
                        result
                    });
                } else {
                    return res.status(401).json({
                        message: 'Failed to update the profile image'
                    });
                }
            });

            blobStream.end(imageFile.buffer);
        } catch (error) {
            console.log(error);
        }
    },

    updateProfileCover: async(req, res, next) => {
        try {
            const userId = req.params.userId;
            const imageFile = req.file;

            if (!imageFile) {
                return res.status(401).json({
                    message: "Please upload the image",
                    success: false
                });
            }

            const blob = bucket.file(`profileCovers/${userId}/${uuidv4()}_${imageFile.originalname}`);
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: imageFile.mimetype
                }
            });

            blobStream.on('error', (error) => {
                console.log(error);
                return res.status(500).json({
                    message: 'Failed to upload image',
                    success: false
                });
            });

            blobStream.on('finish', async() => {
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

                const result = await userService.updateCoverImage({ id: userId, coverImageUrl: publicUrl });

                if (result) {
                    return res.status(200).json({
                        message: 'Profile Cover Image Updated Successfully',
                        success: true,
                        result
                    });
                } else {
                    return res.status(401).json({
                        message: 'Failed to update the profile cover image'
                    });
                }
            });

            blobStream.end(imageFile.buffer);
        } catch (error) {
            console.log(error);
        }
    },
    followUser: async(req, res, next) => {

        const { userId, followUserId } = req.body;


        try {
            const user = await User.findById(userId);
            const followUser = await User.findById(followUserId);

            if (!user || !followUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if the user is already following the followUser
            if (user.following.includes(followUserId)) {
                return res.status(400).json({ message: 'User already followed' });
            }

            user.following.push(followUserId);
            followUser.followers.push(userId);

            await user.save();
            await followUser.save();

            res.status(200).json({ message: 'User followed successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Unfollow a user
    unfollowUser: async(req, res) => {

        const { userId, unfollowUserId } = req.body;

        try {
            const user = await User.findById(userId);
            const unfollowUser = await User.findById(unfollowUserId);

            if (!user || !unfollowUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if the user is following the unfollowUser
            if (!user.following.includes(unfollowUserId)) {
                return res.status(400).json({ message: 'User is not following' });
            }

            user.following.pull(unfollowUserId);
            unfollowUser.followers.pull(userId);

            await user.save();
            await unfollowUser.save();

            res.status(200).json({ message: 'User unfollowed successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    getfollowerFollowing: async(req, res) => {
        try {
            const userId = req.params.userId;

            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const followersCount = user.followers.length;
            const followingCount = user.following.length;

            res.status(200).json({
                message: 'User follower and following counts retrieved successfully',
                followersCount,
                followingCount
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
}



module.exports = authController;