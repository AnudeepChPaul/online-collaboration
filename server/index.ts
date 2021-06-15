import { resolvers, typeDefs } from './graphQL/types_resolvers'

const { ApolloServer, gql } = require( 'apollo-server' )
const { MongoClient, Server } = require( 'mongodb' )

const mongo = new MongoClient( new Server( 'localhost', 27017 ) );

mongo.connect( (err, client) => {
  if ( err ) {
    mongo.close();
  }
  const appServer = new ApolloServer( {
    typeDefs, resolvers,
    subscriptions: {
      onConnect: (connectionParams, webSocket, context) => {
        console.log( 'Connected!' )
      },
      onDisconnect: (webSocket, context) => {
        console.log( 'Disconnected!' )
      }
    },
    context: () => {
      return { db: client.db( 'collab' ) };
    }
  } )

  appServer.listen().then( ({ url }) => {
    console.log( `Server ready at ${url}` );
  } )
} )


