import { resolvers, typeDefs } from './graphQL/types_resolvers'

const { ApolloServer, gql } = require( 'apollo-server' )
const { MongoClient, Server } = require( 'mongodb' )

const mongo: typeof MongoClient= new MongoClient( new Server( 'localhost', 27017 ) );

mongo.connect( (err: Error, client: typeof MongoClient) => {
  if ( err ) {
    mongo.close();
  }
  const appServer: typeof ApolloServer = new ApolloServer( {
    typeDefs, resolvers,
    subscriptions: {
      onConnect: (connecionParams: Object, webSocket: WebSocket) => {
        console.log( 'Connected!' )
      },
      onDisconnect: (connecionParams: Object, webSocket: WebSocket) => {
        console.log( 'Disconnected!' )
      }
    },
    context: () => {
      return { db: client.db( 'collaboration' ) };
    }
  } )

  appServer.listen().then( ({ url: string}) => {
    console.log( `Server ready at ${url}` );
  } )
} )


