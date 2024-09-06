const bcrypt = require('bcrypt');
const prisma = require('./client.cjs');

const createUser = async(email, username, password) =>{
  try {


    const existingUser = await prisma.user.findUnique({
      where: {username:username}
    })
    const existingEmail = await prisma.user.findUnique({
      where: {email: email}
    })
    if(existingUser){
      throw new Error('Username is already in use')
    }
    if(existingEmail){
      throw new Error('Email is already in use')
    }
    const newUser = await prisma.user.create({
      data: {
        email: email,
        username: username,
        password: password
      }
    });
    return newUser
  } catch(error) {
    console.log(`Error creating user: `, error);
  }
}

const getAllUsers = async() => {
  try{
    const users = await prisma.user.findMany();
    return users;
  }catch(error) {
    console.log(`error while getAllUsers: `, error);
  }
}

const getUserById = async(userId) => {
  try{
    const user = await prisma.user.findOne({
      where: { id: userId}
    });
    return user;
  }catch(error) {
    console.log(`error while getUserById: `, error);
  }
}

const updateUser = async(userId) => {
  try{
    const updatedUser = await prisma.user.update({
      where: { id: userId},
      data: { username: 'Lemon Larry'}
    });
    console.log(`User updated: ${updatedUser.username}`)
  }catch(error) {
    console.log(`error while updateUser`, error);
  }
}

const deleteUser = async(userId) => {
  try{
    await prisma.user.delete({
      where: { id: userId}
  });
  console.log(`User with ID ${userId} has been deleted.`);
  }catch(error){
    console.log(`Error while deleteUser: `, error);
  }
}

module.exports = {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
}
