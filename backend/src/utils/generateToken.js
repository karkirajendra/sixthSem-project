const generateToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  // Set cookie
  res.cookie('token', token, options);

  // Remove password from output
  const userOutput = { ...user.toObject() };
  delete userOutput.password;

  res.status(statusCode).json({
    success: true,
    token,
    data: userOutput,
  });
};

export default generateToken;
