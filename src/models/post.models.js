import mongoose, { Schema } from "mongoose";

const postSchema = new mongoose.Schema(
    {
        postText: {
            type: String,            
        },
        postPic: {
            type: String,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        // postComments: {
        //     type: Schema.Types.ObjectId,
        //     ref: "Comment"
        // }
    },
    { timestamps: true }
)

export const Post = mongoose.model("Post", postSchema)