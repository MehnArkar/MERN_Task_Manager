const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:"7d"});
}

const registerUser = async(req,res)=>{
    try{
        const {name, email, password, profileImageUrl, adminIviteToken} = req.body;

        //Check if user already exist
        const userExist = await User.findOne({email});
        if(userExist){
            return res.status(400).json({message:"User already exist"});
        }

        let role = "member";
        if(adminIviteToken && adminIviteToken == process.env.ADMIN_INVITE_TOKEN){
            role = "admin";
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            profileImageUrl,
            role
        });

        res.status(201).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id)
        });

    }catch(e){
        res.status(500).json({message:"Server Error", error:e.message});
    }

};


const loginUser = async(req,res)=>{
    try{
        const {email,password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({"message":"User not found"});
        }

        const isPasswordMatch = await bcrypt.compare(password,user.password);

        if(!isPasswordMatch){
            return res.status(400).json({"message":"Incorrect password"});
        }

        res.status(200).json({
            _id:user._id,
            name:user.name,
            email:user.email,
            role:user.role,
            profileImageUrl:user.profileImageUrl,
            token:generateToken(user._id)
        });
    }catch(error){
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
};


const getUserProfile = async(req,res)=>{
    try{
        const user = await User.findById(req.user._id).select("-password");
        if(!user){
            return res.status(400).json({message:"User not found"});
        }

        res.status(200).json(user);
    }catch(error){
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
};


const updateUserProfile = async(req,res)=>{
    try{
        let user = await User.findById(req.user._id);
        if(!user){
            return res.status(400).json({message:"User not found"});
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if(req.body.password){
            let salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password,salt);
        }

        const updateUser = await user.save();

        res.json({
            _id:updateUser._id,
            name:updateUser.name,
            email:updateUser.email,
            profileImageUrl:updateUser.profileImageUrl,
            role:updateUser.role,
            token:generateToken(updateUser._id) 
        });


    }catch(error){
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
};

module.exports = {registerUser,loginUser,getUserProfile,updateUserProfile};