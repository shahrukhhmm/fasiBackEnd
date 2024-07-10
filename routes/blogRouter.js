const express=require('express');
const router=express();

const auth=require('../middleware/auth')
const blogController=require('../controllers/blogController')

router.post('/create',blogController.create)
router.get('/getAll',blogController.getAll)
router.get('/getById/:id',blogController.getById)
router.put('/update/:id',blogController.update)
module.exports=router;
