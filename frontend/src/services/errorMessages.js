const errorMessages = {
    INVALID_ANSWER: "That answer is not valid",
    QUESTION_NOT_FOUND: "We couldn't find that question",
    QUIZ_ALREADY_SUBMITTED: "This quiz has already been submitted",
    QUIZ_NOT_FOUND: "We couldn't find that quiz",
    INVALID_CATEGORY: "The selected category is not valid",
    INVALID_FILTER: "The selected filters are not valid",
    EXTERNAL_SERVICE_UNAVAILABLE: "The quiz service is temporarily unavailable. Please try again",
    VALIDATION_ERROR: "Please check the entered values and try again",
    REQUEST_PARAMETER_INVALID: "One of the request parameters is invalid",
    REQUEST_BODY_INVALID: "The submitted data is invalid",
    MALFORMED_JSON: "The request could not be read. Please try again",
    UPSTREAM_HTTP_ERROR: "A connected service returned an error. Please try again",
    INTERNAL_SERVER_ERROR: "Something went wrong. Please try again",
};

export function getFriendlyErrorMessage(error) {
    return errorMessages[error?.code] || error?.message || errorMessages.INTERNAL_SERVER_ERROR;
}

export default errorMessages;
