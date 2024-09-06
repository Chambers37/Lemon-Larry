const express = require('express');
const prisma = require('../DB/client.cjs');
const bcrypt = require('bcrypt');
const { registerUser, loginUser } = require('./auth.cjs')

const usersRouter = express.Router();

usersRouter.post('/', registerUser);

usersRouter.post('/Login', loginUser);

usersRouter.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error while fetching users:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

usersRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error while fetching user:', error);
    res.status(500).json({ message: 'Failed to retrieve user' });
  }
});


usersRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { email, username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedData = {};
    if (email) updatedData.email = email;
    if (username) updatedData.username = username;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updatedData,
    });

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error while updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

usersRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error while deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = usersRouter;
