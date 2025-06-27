const {Router} = require("express")
const courseRouter = Router();
const {userMiddleware} = require("../middleware/user")
const {purchaseModel, courseModel} = require("../db")

courseRouter.post("/purchase", async function(req,res){
    const userId = req.userId;
    const courseId = req.body.courseId;

  const purchasedCourse =  await purchaseModel.create({
        userId,
        courseId
    })

    res.json({
        message: "Course Purchased",
        purchasedCourse
    })
});

courseRouter.get("/preview", async function(req,res){

    const courses = await courseModel.find({})
    
    res.json({
        message: "View Courses",
        courses
    })
});

module.exports = {
    courseRouter: courseRouter
};
