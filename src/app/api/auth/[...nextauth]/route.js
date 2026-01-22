import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/mongodb/db";
import { getServerSession } from "next-auth"

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      {
        id: "AniListProvider",
        name: "AniList",
        type: "oauth",
        token: "https://anilist.co/api/v2/oauth/token",
        authorization: {
          url: "https://anilist.co/api/v2/oauth/authorize",
          params: { scope: "", response_type: "code" },
        },
        userinfo: {
          url: process.env.GRAPHQL_ENDPOINT,
          async request(context) {
            const { data } = await fetch("https://graphql.anilist.co", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${context.tokens.access_token}`,
                Accept: "application/json",
              },
              body: JSON.stringify({
                query: `
                  query {
                    Viewer {
                      id
                      name
                      avatar {
                        large
                        medium
                      }
                      bannerImage
                      createdAt
                      mediaListOptions {
                        animeList {
                          customLists
                        }
                      }
                    }
                  }
                `,
              }),
            }).then((res) => res.json());
  
            const userLists = data.Viewer?.mediaListOptions.animeList.customLists;
  
            let customLists = userLists || [];
  
            if (!userLists?.includes("Watched Via Airin")) {
              customLists.push("Watched Via Airin");
              const fetchGraphQL = async (query, variables) => {
                const response = await fetch("https://graphql.anilist.co/", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...(context.tokens.access_token && {
                      Authorization: `Bearer ${context.tokens.access_token}`,
                    }),
                    Accept: "application/json",
                  },
                  body: JSON.stringify({ query, variables }),
                });
                return response.json();
              };
  
              const modifiedLists = async (lists) => {
                const setList = `
                      mutation($lists: [String]){
                        UpdateUser(animeListOptions: { customLists: $lists }){
                          id
                        }
                      }
                    `;
                const data = await fetchGraphQL(setList, { lists });
                return data;
              };
  
              await modifiedLists(customLists);
            }
  
            return {
              token: context.tokens.access_token,
              name: data.Viewer.name,
              sub: data.Viewer.id,
              image: data.Viewer.avatar,
              createdAt: data.Viewer.createdAt,
              list: data.Viewer?.mediaListOptions.animeList.customLists,
            };
          },
        },
        clientId: process.env.ANILIST_CLIENT_ID,
        clientSecret: process.env.ANILIST_CLIENT_SECRET,
        profile(profile) {
          return {
            token: profile.token,
            id: profile.sub,
            name: profile?.name,
            image: profile.image,
            createdAt: profile?.createdAt,
            list: profile?.list,
          };
        },
      },
    ],
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
      async jwt({ token, user, trigger }) {
        // On sign in, save user data
        if (user) {
          return { ...token, ...user };
        }
        
        // Refresh token every 24 hours
        const shouldRefresh = token.lastRefresh 
          ? Date.now() - token.lastRefresh > 24 * 60 * 60 * 1000 
          : true;
        
        if (shouldRefresh && token.token) {
          try {
            const { data } = await fetch("https://graphql.anilist.co", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token.token}`,
                Accept: "application/json",
              },
              body: JSON.stringify({
                query: `
                  query {
                    Viewer {
                      id
                      name
                      avatar {
                        large
                        medium
                      }
                      bannerImage
                    }
                  }
                `,
              }),
            }).then((res) => res.json());
            
            if (data?.Viewer) {
              token.name = data.Viewer.name;
              token.image = data.Viewer.avatar;
              token.lastRefresh = Date.now();
            }
          } catch (error) {
            // If refresh fails, keep old token
          }
        }
        
        return token;
      },
      async session({ session, token, user }) {
        session.user = token;
        return session;
      },
    },
  };
  
const handler = NextAuth(authOptions)

export const getAuthSession = () => getServerSession(authOptions)

export { handler as GET, handler as POST }