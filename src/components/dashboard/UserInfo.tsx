import { DecodedToken } from "@/lib/auth.utils";

interface UserInfoProps {
  user: DecodedToken;
}

export const UserInfo = ({ user }: UserInfoProps) => (
  <div className="mb-8">
    <h1 className="text-3xl font-bold mb-2">Welcome to Zephyron Hub! 🚀</h1>
    <p className="text-gray-600">
      Signed in as: <strong>{user.name}</strong> (
      <span className="text-blue-600">{user.email}</span>)
    </p>
  </div>
);
