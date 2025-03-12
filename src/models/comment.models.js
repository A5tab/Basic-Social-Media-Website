import mongoose, { Schema } from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        text: {
            type: String
        }
    }
)

export const Comment = mongoose.model("Comment", commentSchema)