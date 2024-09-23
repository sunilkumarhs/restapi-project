const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type PostData {
        title: String!
        content: String!
        imageUrl: String!
        creator: String!
        createdAt: String!
        updatedAt: String!
    }
    
    type User {
        id: ID!
        email: String!
        name: String!
        password: String!
        status: String!
        posts: [PostData!]
    }

    type UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
    }

    schema {
        mutation: RootMutation
    }
`);

// type TestData {
//     text: String!
//     view: Int!
// }

// type RootQuery {
//     hello: TestData!
// }
// schema {
//     query: RootQuery
// }
