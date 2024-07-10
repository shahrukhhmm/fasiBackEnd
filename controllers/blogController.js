const Joi = require('joi');
const blogService=require('../services/blogService')

const blogController={
    create:async(req,res,next)=>{
        try {
            const updateSchema = Joi.object({
                title: Joi.string().min(5).max(20).required(),
                content: Joi.string().min(2).max(100).required(),
                photopath: Joi.string().optional(),
                author:Joi.string().required()
            });

            const { error } = updateSchema.validate(req.body);

            if (error) {
                return res.status(400).send(error.details[0].message);
            }
        const {title,content,photopath,author}=req.body;
            const Creat=await blogService.create(title,content,photopath,author);
        if(Creat){
            res.status(201).send({message:'Blog Created',Creat});
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
    },
    getAll: async (req, res, next) => {
        try {
            const all = await blogService.getAll()
            if (all) {
                res.status(200).send({ message: "All Data", data: all })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const id=req.params.id;
            const one = await blogService.getById(id);
            if (one) {
                res.status(200).send({ message: "Record Found", data: one })
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    },
    update:async(req,res,next)=>{
        try {
            const id=req.params.id;
            const updateSchema = Joi.object({
                title: Joi.string().min(5).max(20).required(),
                content: Joi.string().min(2).max(100).required(),
                photopath: Joi.string().optional(),
                author:Joi.string().required()
            });

            const { error } = updateSchema.validate(req.body);

            if (error) {
                return res.status(400).send(error.details[0].message);
            }
            const{title,content,photopath,author}=req.body;
            const updateOne=await blogService.update(id,title,content,photopath,author)
            if(!updateOne){
                res.status(400).send({message:error.message})
            }else{
                res.status(200).send({message:"Blog Updated",data:updateOne})
            }
        } catch (error) {
            console.log(error);
            res.status(500).send(error);
        }
    }
}
module.exports=blogController;
