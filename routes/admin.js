const { Router } = require("express")
const { adminModel } = require("../db")
const adminRouter = Router();
const jwt = require("jsonwebtoken");
const {JWT_ADMIN_SECRET} = require("../config")
const { z } = require("zod");
const bcrypt = require("bcrypt")
const { adminMiddleware } = require("../middleware/admin");
const { courseModel } = require("../db")

adminRouter.post("/signup", async function(req,res){
    
    const requiredBody = z.object({
        email: z.string().min(3).max(100).email(),
        password: z.string().min(5).max(100),
        firstName: z.string().max(100),
        lastName: z.string().max(100)
    });

    const parsedDatawithSuccess = requiredBody.safeParse(req.body);

    if(!parsedDatawithSuccess.success){
        res.json({
            message: "Incorrect credentials format",
            error: parsedDatawithSuccess.error 
        })
        return
    }

    let thrownError = false;
    const {email, password, firstName, lastName } = req.body;

    try{    
        const hashedPassword = await bcrypt.hash(password,5);
        await adminModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        })
    }
    catch(e){
        res.status(403).json({
            message: "Admin already exists with the same credentials"
        })
        thrownError = true
    }
    if(!thrownError){
    res.json({
        message: "Signed Up"
    })
}
});

adminRouter.post("/signin", async function(req,res){
    const {email , password} = req.body;
    const admin = await adminModel.findOne({
        email: email
    })
    if(!admin){
        res.status(403).json({
            message: "Incorrect email or password"
        })
        return
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if(passwordMatch){
        const token = jwt.sign({
            id: admin._id.toString()
        },JWT_ADMIN_SECRET)
        res.json({
            token: token
        })
    }else{
        res.json({
            message: "Password incorrect or email"
        })
    }
});

adminRouter.post("/course", adminMiddleware, async function(req,res){

    const adminId = req.userId;
    const { title, description, imageUrl, price} = req.body;

    const course = await courseModel.create({
      title: title,
      description: description,
      imageUrl: imageUrl,
      price: price,
      creatorId: adminId
    })

    res.json({
        message: "Course Created",
        courseId: course._id
    })
});

adminRouter.put("/course", adminMiddleware, async function(req,res){
    const adminId = req.userId;
    const { title, description, imageUrl, price, courseId} = req.body;
    
    const course = await courseModel.updateOne(
        {
        _id: courseId,
        creatorId: adminId
        },

    {
      title: title,
      description: description,
      imageUrl: imageUrl,
      price: price,
    })

    res.json({
        message: "Course Updated",
        courseId: course._id
    })
});

adminRouter.get("/course/bulk", adminMiddleware, async function(req,res){
    const adminId = req.userId;
    const courses = await courseModel.find({
        creatorId: adminId
    })
    res.json({
        message: "Admin Courses",
        courses
    })
});


module.exports = {
    adminRouter: adminRouter
}