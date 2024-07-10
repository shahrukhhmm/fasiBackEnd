const Blog = require('../models/blog');
const bcrypt = require("bcrypt");

const blogService = {
    create: async (title,content,photoPath,author) => {
       const dup=await Blog.findOne({title:title});
       if(dup){
        return {statusCode:409, message:"Blog Name Already Taken"}
       }
       const newblog=await new Blog({
        title:title,
        content:content,
        photoPath:photoPath,
        author:author
       })
       if(newblog){
           await newblog.save();
           return newblog;
       }else{
        return{statusCode:400,message:"Error in Creating BLog"}
       }
    },
    getAll: async () => {
        const Blogs = await Blog.find().populate({
            path:"author",
            model:"User",
            select:'username'
        });
        if (!Blogs) {
            return { statusCode: 500, message: "Error retrieving data" };
        } else {
            return Blogs;
        }
    },
    getById: async (id) => {
        const BlogRecord = await Blog.findById(id);
        if (!BlogRecord) {
            return { statusCode: 404, message: "No Blog found with the given id" };
        } else {
            return BlogRecord;
        }
    },
    update:async(id,title,content,photoPath,author)=>{
        const searched=await Blog.findById(id);
        if(!searched){
            return { statusCode: 404, message: "No Blog found with the given id" };
        }else{
            if(title){
                searched.title=title;
            }
            if(content){
                searched.content=content;
            }
            if(photoPath){
                searched.photoPath=photoPath;
            }
            if(author){
                searched.author=author;
            }
            const updatedBlog=searched.save();
            return updatedBlog;
        }
    }

};

module.exports = blogService;
