// requires npm i validator

const validator = require("validator");
const isEmpty = require("./isEmpty");

const validateRegisterInput = (data) => {
  let errors = {};

  // check the email field
  if (isEmpty(data.email)) {
    errors.email = "Email field cannot be empty.";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid, please provide a valid email.";
  }

  // check the name field
  if (isEmpty(data.name)) {
    errors.name = "Name field cannot be empty.";
  } else if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name field must be between 2 and 30 characters long.";
  }

  // check password field
  if (isEmpty(data.password)) {
    errors.password = "Password field cannot be empty.";
  } else if (!validator.isLength(data.password, { min: 6, max: 150 })) {
    errors.password = "Password must be between 6 and 150 characters long.";
  }

  // check confirm password field
  if (isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Confirm password field cannot be empty.";
  } else if (!validator.equals(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Password and Confirm Password fields must match.";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateRegisterInput;