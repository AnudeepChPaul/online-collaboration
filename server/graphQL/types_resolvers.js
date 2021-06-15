const { ApolloError } = require('apollo-server')
const { PubSub } = require('graphql-subscriptions')
const { gql } = require('apollo-server')
const fs = require('fs')

class DBFailureError extends ApolloError {
  constructor(message) {
    super(message, 'DB_UNABLE_TO_RETURN_DATA');

    Object.defineProperty(this, 'name', { value: 'DBFailureError' });
  }
}


const drawingCanvas = {
  users: [],
  markups: []
}

const pubsub = new PubSub()

let UserColorList = [ '#4a148c', '#880e4f', '#b71c1c', '#311b92', '#0d47a1', '#004d40', '#1b5e20' ]
const ImmuteUsersColorList = UserColorList.concat();

const getUserColor = () => {
  return UserColorList.splice(Math.floor(Math.random() * UserColorList.length - 1) + 1, 1)[0];
}

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


const typeDefs = gql`
    type User {
        name: String!
        color: String!
    }

    type Point {
        x: Float
        y: Float
    }

    type Markup {
        type: Int!
        points: [Point!]!
        user: User!
        markupId: String!
    }

    type Response {
        success: Boolean!
    }

    input UserInput {
        name: String!
    }

    input PointInput {
        x: Float
        y: Float
    }

    input MarkupInput {
        type: Int!
        points: [PointInput]
        user: UserInput!
        markupId: String
    }

    type Mutation {
        addMarkupToCanvas(markup: MarkupInput): Markup
        assignUser(name: String!): User!
        uploadImgDataUrl(imgData: String!): Response!
    }

    type Subscription {
        onMarkupAdded: Markup
        onUserJoined: User
    }

    type Query {
        getMarkupsForCanvas: [Markup]
    }
`

const resolvers = {
  Query: {
    getMarkupsForCanvas: async (_, {}, { db }) => {
      return (await db.collection('markups').find({})).toArray()
    }
  },
  Mutation: {
    addMarkupToCanvas: async (_, { markup }, { db }) => {

      const users = db.collection('users');
      const markups = db.collection('markups');

      const { name, color } = await users.findOne({ name: markup.user.name })
      const newMarkup = { ...markup, markupId: uuid(), user: { name, color } }

      try {
        await markups.insertOne(newMarkup);
      } catch (e) {
        throw new DBFailureError('UNABLE_TO_INSERT_MARKUP')
      }

      try {
        const insertedMarkup = await markups.findOne({ markupId: newMarkup.markupId })
        pubsub.publish('MARKUP_ADDED', {
          onMarkupAdded: insertedMarkup
        })
        return insertedMarkup

      } catch {
        throw new DBFailureError('UNABLE_TO_FIND_INSERTED_MARKUP')
      }
    },

    assignUser: async (_, { name }, { db }) => {
      const collection = db.collection('users');

      try {
        const exisingUser = await collection.findOne({ name: name });
        if ( exisingUser && exisingUser.name && exisingUser.color ) {
          await pubsub.publish('USER_JOINED', {
            onUserJoined: exisingUser
          })
          return exisingUser;
        }
      } catch {
      }


      let color = getUserColor();
      if ( !color ) {
        UserColorList = ImmuteUsersColorList.concat();
        color = getUserColor();
      }

      try {
        await collection.updateOne({ name: name }, { '$set': { name: name, color } }, { upsert: true });
      } catch (e) {
        throw new DBFailureError('UNABLE_TO_UPDATE_USER')
      }

      try {
        const addedUser = await collection.findOne({ name: name })
        await pubsub.publish('USER_JOINED', {
          onUserJoined: addedUser
        })
        return addedUser
      } catch {
        throw new DBFailureError('UNABLE_TO_FIND_UPSERTED_USER')
      }
    },

    uploadImgDataUrl: (_, { imgData }) => {
      const time = new Date().toISOString()
      const downloadsFolder = './downloads';

      try {
        if ( !fs.existsSync(downloadsFolder) ) {
          fs.mkdirSync(downloadsFolder);
        }
        fs.writeFileSync(`./downloads/${time}.png`, new Buffer(imgData.replace("data:image/png;base64,", "")), 'base64')

        return {
          success: true
        }
      } catch {
        return {
          success: false
        }
      }
    }
  },
  Subscription: {
    onMarkupAdded: {
      subscribe: () => pubsub.asyncIterator([ 'MARKUP_ADDED' ])
    },

    onUserJoined: {
      subscribe: () => pubsub.asyncIterator([ 'USER_JOINED' ])
    }
  }
}

module.exports = { typeDefs, resolvers }