
const { User, Book } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');


const resolvers = {
  // Important for useQuery: The resolver matches the typeDefs entry point and informs the request of the relevant data
  Query: {
    me: async () => {
      return User.find();
    },

    // Important for Query Variables: Each query resolver function can accept up to four parameters.
    // The second parameter, commonly referred to as "args," represents the variable argument values passed with the query.
    // It is always an object, and in this case, we are destructuring that object to retrieve the profileId value.
    user: async (parent, { username }) => {
      return User.findOne( {username} );
    },
  },
  // Important for useMutation: The resolver matches the typeDefs entry point and informs the request of the relevant data
  Mutation: {
    
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw AuthenticationError
      }
      const correctPw = await user.isCorrectPassword(password);
      if (!correctPw) {
        throw AuthenticationError
      }

      const token = signToken(user);

      return { token, user };
    },
    addUser: async (parent, { username, email, password }) => {
      return User.create({ username, email, password });
    },
    saveBook: async(parent, { description, title, bookId, image, link}) => {
      return User.create({ description, title, bookId, image, link});
    },
    removeBook: async (parent, { bookId }) => {
      return User.findOneAndDelete({bookId });
    },
    
  },
};

module.exports = resolvers;
