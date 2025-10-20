import { DecodedToken } from "@/lib/auth.utils";
import { SignOutButton } from "./SignOutButton";

interface UserInfoProps {
  user: DecodedToken;
}

export const UserInfo = ({ user }: UserInfoProps) => (
  <div className="mb-8 flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold mb-1">Zephyron Hub</h1>
      <p className="text-gray-400">
        Signed in as: <strong>{user.name}</strong>
      </p>
    </div>
    <SignOutButton />
  </div>
);

