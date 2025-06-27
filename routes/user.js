const {Router} = require("express");
const userRouter = Router();
const { userModel, purchaseModel, courseModel } = require("../db")
const bcrypt = require("bcrypt")
const { z } = require("zod");
const { parse } = require("dotenv");
const jwt = require("jsonwebtoken");
const {JWT_USER_SECRET} = require("../config");
const { userMiddleware } = require("../middleware/user");

userRouter.post("/signup", async function(req,res){
    
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
        await userModel.create({
            email: email,
            password: hashedPassword,
            firstName: firstName,
            lastName: lastName
        })
    }
    catch(e){
        res.status(403).json({
            message: "User already exists with the same credentials"
        })
        thrownError = true
    }
    if(!thrownError){
    res.json({
        message: "Signed Up"
    })
}
});

userRouter.post("/signin", async function(req,res){
    const {email , password} = req.body;
    const user = await userModel.findOne({
        email: email
    })
    if(!user){
        res.status(403).json({
            message: "Incorrect email or password"
        })
        return
    }
    const passwordMatch = await bcrypt.compare(password, user.password);

    if(passwordMatch){
        const token = jwt.sign({
            id: user._id.toString()
        },JWT_USER_SECRET)
        res.json({
            token: token
        })
    }else{
        res.json({
            message: "Password incorrect or email"
        })
    }
});

userRouter.get("/purchases", userMiddleware, async function(req,res){
    const userId = req.userId;
    const purchases = await purchaseModel.find({
        userId
    })
    const courseData = await courseModel.find({
        _id: { $in: purchases.map(x => x.courseId)}
    })
    res.json({
        message: "Purchased Courses",
        courseData
    })
});

module.exports = {
    userRouter: userRouter
}