const User = require("../models/User");
const Task = require("../models/Task");

const getUsers = async(req,res)=>{
    try{
        const users = await User.find({role:"member"}).select("-password");

        const usersWithTaskCounts = await Promise.all(users.map(async(user)=>{
            const pendingTasks = await Task.countDocuments({assignedTo:user._id,status:"Pending"});
            const inProgressTasks = await Task.countDocuments({assignedTo:user._id,status:"In Progress"});
            const completeTasks = await Task.countDocuments({assignedTo:user._id,status:"Completed"});

            return {
                ...user._doc,
                pendingTasks,
                inProgressTasks,
                completeTasks
            };

        }));

        res.status(200).json(usersWithTaskCounts);


    }catch(e){
        res.status(500).json({message:"Server Error",error:e.message});
    }
}

const getUserById = async(req,res)=>{
    try{
        const user = await User.findById(req.params.id).select("-password");
        if(!user) return res.status(404).json({message:"User not found"});

        res.status(200).json(user);
    }catch(e){
        res.status(500).json({message:"Server Error",error:e.message});
    }
}


module.exports = {getUsers,getUserById};