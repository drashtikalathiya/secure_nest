import {
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

export const firebaseSignup = async (email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res.user;
};

export const updateFirebaseUserProfile = async (user, payload) => {
  if (!user) return;
  await updateProfile(user, payload);
};

export const firebaseLogin = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};

export const firebaseLogout = async () => {
  await signOut(auth);
};
