import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "../../store/api/authApi";
import {
    setUser,
    clearUser,
    finishAuthLoading,
} from "../../store/slices/authSlice";
import "./AuthInitializer.css";

function AuthInitializer({ children }) {
    const dispatch = useDispatch();

    const token = localStorage.getItem("gehna_api_token");

    const {
        data,
        isLoading,
        isError,
    } = useGetMeQuery(undefined, {
        skip: !token,
    });

    useEffect(() => {
        if (!token) {
            dispatch(finishAuthLoading());
            return;
        }

        if (data?.success && data?.data) {
            dispatch(setUser(data.data));
        }

        if (isError) {
            dispatch(clearUser());
        }
    }, [token, data, isError, dispatch]);

    if (token && isLoading) {
        return (
            <div className="auth-loading" role="status" aria-live="polite">
                <span className="auth-loading__spinner" aria-hidden="true"></span>
                <span>Checking your account...</span>
            </div>
        );
    }

    return children;
}

export default AuthInitializer;