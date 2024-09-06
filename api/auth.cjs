const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../DB/client.cjs');
const { createUser } = require('../DB/users.cjs');

const secretKey = process.env.JWT_SECRET_KEY;

const registerUser = async(req, res) => {
  const {email, username, password } = req.body;
  try{
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const newUser = await createUser(email, username, hashedPassword);
    console.log(`stored userpassword:`, newUser.password)
    res.status(200).json({
      message: `User: ${newUser.username} Registered Successfully!`,
      user: newUser
    })
  } catch(error) {
    console.log(`Error while registerUser: `, error);
    res.status(500).json({
      message: 'Registration Failed', error
    });
  }
}

const loginUser = async (req,res) => {
  const { username, password } = req.body
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    if(!user){
      return res.status(401).json({
        message:'Invalid Username'
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if(!passwordMatch) {
      return res.status(401).json({
        message: `Invalid Password`
      })
    }
    if(user && passwordMatch){
      const token = jwt.sign({userId: user.id}, secretKey, {expiresIn: '4h'})
      res.status(200).json({message: `You are now logged in as ${user.username}`, token})
    }
  } catch(error) {
    console.log('Error while loggin in: ', error)
    res.status(500).json({message: 'Login Failed'});
  }
}


const logoutUser = (req,res) => {
  res.status(200).json({message:'Logout successful'});
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
}
