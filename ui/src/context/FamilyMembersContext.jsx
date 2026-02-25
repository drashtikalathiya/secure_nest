import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getFamilyMembers } from "../services/usersApi";
import { useAuth } from "./AuthContext";

const FamilyMembersContext = createContext();

export const FamilyMembersProvider = ({ children }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const inFlightRef = useRef(null);

  const fetchMembers = useCallback(async () => {
    if (inFlightRef.current) return inFlightRef.current;

    setLoading(true);
    const request = getFamilyMembers()
      .then((res) => {
        const nextMembers = Array.isArray(res?.data) ? res.data : [];
        setMembers(nextMembers);
        return nextMembers;
      })
      .catch(() => {
        setMembers([]);
        return [];
      })
      .finally(() => {
        inFlightRef.current = null;
        setLoading(false);
      });

    inFlightRef.current = request;
    return request;
  }, []);

  const refreshMembers = useCallback(async () => fetchMembers(), [fetchMembers]);

  useEffect(() => {
    if (!user?.email) {
      setMembers([]);
      setLoading(false);
      return;
    }

    fetchMembers();
  }, [fetchMembers, user?.email]);

  return (
    <FamilyMembersContext.Provider
      value={{
        members,
        loading,
        refreshMembers,
      }}
    >
      {children}
    </FamilyMembersContext.Provider>
  );
};

export const useFamilyMembers = () => useContext(FamilyMembersContext);
