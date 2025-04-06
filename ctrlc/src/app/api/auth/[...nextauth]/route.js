











import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";



import { connectMongoDB } from "../../../../../lib/mongodb";
import User from "../../../../../models/user";
import bcrypt from 'bcryptjs'

const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                    role: 'user'
                };
            }
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const { email, password } = credentials;

                try {
                    await connectMongoDB();
                    const user = await User.findOne({ email });

                    if (!user) {
                        return null;
                    }

                    const passwordMatch = await bcrypt.compare(password, user.password);

                    if (!passwordMatch) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };
                } catch(error) {
                    console.error("Authorization Error:", error);
                    return null;
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {
                try {
                    await connectMongoDB();
                    
                    // Check if user already exists
                    const existingUser = await User.findOne({ 
                        email: user.email
                    });

                    // If the user does not exist, create a new one
                    if (!existingUser) {
                        const newUser = new User({
                            email: user.email,
                            name: user.name,
                            role: "user",
                            provider: "google",
                            isOnboard: false
                        });

                        await newUser.save();
                        console.log("New Google user saved:", newUser);
                    }

                    return true;
                } catch (error) {
                    console.error("Google Sign-in Error:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (account?.provider === "google" || user) {
                const dbUser = await User.findOne({ email: token.email });
                
                return {
                    ...token,
                    id: dbUser?._id?.toString() || user?.id,
                    role: dbUser?.role || user?.role || "user",
                    isOnboard: dbUser?.isOnboard || false,
                    provider: account?.provider || "credentials"
                };
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    ...session.user,
                    id: token.id,
                    role: token.role,
                    isOnboard: token.isOnboard,
                    provider: token.provider
                };
            }
            return session;
        }
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };