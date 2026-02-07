import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";

export const firebaseSignup = async (email, password) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res.user;
};

export const firebaseLogin = async (email, password) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res.user;
};
