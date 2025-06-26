const {Router} = require("express")
const courseRouter = Router();

courseRouter.post("/purchase", function(req,res){
    res.json({
        message: "Purchase Courses"
    })
});

courseRouter.get("/preview", function(req,res){
    res.json({
        message: "View Courses"
    })
});

module.exports = {
    courseRouter: courseRouter
};
