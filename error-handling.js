// Log
console.log('Loaded: error-handling.js');


function catchException (err, funcName, data, res)
{
    error = { };
    error.err = err;
    error.bodyData = data;
    error.funcName = funcName;

    console.log(error);  
}



exports.procException = catchException;