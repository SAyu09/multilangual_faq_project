export const ApiError = (message = "An error occurred", statusCode = 400, error = null) => {
    return {
      status: "error",
      message,
      error,
      statusCode,
    };
  };
