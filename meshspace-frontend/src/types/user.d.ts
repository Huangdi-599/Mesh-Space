export interface User{
    _id: string;
    username: string;
    email: string;
    isVerified: boolean;
    followers: string[];
    following: string[];
    createdAt: string;
    updatedAt: string;
    avatar:string
  };