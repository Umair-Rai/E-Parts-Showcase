// Password validation utility
const validatePassword = (password) => {
  // Password must be at least 8 characters long and contain:
  // - At least 1 uppercase letter
  // - At least 1 lowercase letter  
  // - At least 1 number
  // - At least 1 special character (@$!%*?&)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  if (!passwordRegex.test(password)) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character (@$!%*?&)"
    };
  }
  
  return {
    isValid: true,
    message: "Password is valid"
  };
};

module.exports = {
  validatePassword
};
