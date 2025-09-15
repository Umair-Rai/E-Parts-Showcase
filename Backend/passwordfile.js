
const bcrypt = require('bcryptjs');

(async () => {
  const plainPassword = '1234';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  console.log('Hashed password:', hashedPassword);
})();