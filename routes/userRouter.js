const express = require('express');
const router = express();
const auth = require('../middleware/auth')
const authController = require('../controllers/userController')
const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/signUp', authController.register)
router.get('/getAll', authController.getAll)
router.get('/getById/:id', authController.getById)
router.post('/Login', authController.Login)
router.post('/Logout', authController.LogOut)
router.post('/Refresh', authController.refresh)
router.put('/update-profile-data/:userId', authController.updateProfile)
    // router.put('/update-profile-data/:userId', upload.single('profileImage'), authController.updateProfile)
router.put('/update-profile-image/:userId', upload.single('profileImage'), authController.updateProfileImage)
router.put('/update-profile-cover/:userId', upload.single('profileCoverImage'), authController.updateProfileCover)
router.post('/follow', authController.followUser);
router.post('/unfollow', authController.unfollowUser);
router.get('/user-followers/:userId', authController.getfollowerFollowing);


module.exports = router;