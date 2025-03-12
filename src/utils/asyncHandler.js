// AsyncHandler with promise
const asyncHandler = (requestHandler) => {
    // Define the `asyncHandler` function that takes a function `requestHandler` as its argument.
    return (req, res, next) => {
        // Return a new function that takes `req`, `res`, and `next` as arguments.
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
        // Execute the `requestHandler` function with `req`, `res`, and `next` as arguments,
        // and wrap its result in a resolved Promise.
        // If the Promise is rejected (an error occurs in `requestHandler`), catch the error and pass it to `next`.
    }
}



export { asyncHandler }

/*
// AsyncHandler with try-catch
const asyncHandler = (fn) => {
    // Define the `asyncHandler` function, which takes a function `fn` as its argument.
    
    async (req, res, next) => {
        // Return an asynchronous function that takes `req`, `res`, and `next` as arguments.
        
        try {
            // Begin a `try` block to handle any potential errors that might occur in the asynchronous function.

            await fn(req, res, next);
            // Await the execution of the function `fn`, passing `req`, `res`, and `next` to it.
            // This allows `fn` to execute and ensures any asynchronous code is resolved.
            
        } catch (error) {
            // Catch any errors thrown during the execution of `fn`.
            
            res.status(error.code || 500).json({
                // Set the HTTP status code of the response. Use the `code` property from the error if it exists,
                // otherwise default to 500 (Internal Server Error).
                
                success: false,
                // Include a `success` property set to `false` to indicate the operation was not successful.
                
                message: error.message
                // Include a `message` property with the error message from the caught error.
            });
        }
    }
};
*/


/* steps: 
1. const asyncHandler = (fn) => {}
2. const asyncHandler = (fn) => { () => {} }
3. const asyncHandler = (fn) => () => {}
4. const asyncHandler = (fn) => async () => {}
*/