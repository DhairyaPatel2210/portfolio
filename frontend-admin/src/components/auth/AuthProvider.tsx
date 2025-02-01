import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentToken,
  selectCurrentUser,
} from "@/lib/store/features/authSlice";

interface AuthProviderProps {
  children: React.ReactNode;
}

function AuthProvider({ children }: AuthProviderProps) {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  // No need for initialization logic since we're using Redux persist
  // The auth state will be automatically rehydrated

  return <>{children}</>;
}

export default AuthProvider;
