const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }
      return User.findById(context.user.id).populate('savedBooks');
    },

    user: async (parent, { username }) => {
      return User.findOne({ username });
    },
  },

  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw new AuthenticationError('Incorrect password');
      }

      const token = signToken(user);
      return { token, user };
    },

    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },

    saveBook: async (parent, { book }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const { authors, description, title, bookId, image, link } = book;

      const updatedUser = await User.findByIdAndUpdate(
        context.user.id,
        {
          $addToSet: {
            savedBooks: { authors, description, title, bookId, image, link }
          }
        },
        { new: true }
      ).populate('savedBooks');

      return updatedUser;
    },

    removeBook: async (parent, { bookId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('Not authenticated');
      }

      const updatedUser = await User.findByIdAndUpdate(
        context.user.id,
        {
          $pull: { savedBooks: { bookId } }
        },
        { new: true }
      ).populate('savedBooks');

      return updatedUser;
    },
  },
};

module.exports = resolvers;
