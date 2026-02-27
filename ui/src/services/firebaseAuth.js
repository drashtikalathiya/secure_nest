import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  signOut,
  signInWithEmailAndPassword,
  updatePassword,
  updateProfile,
  confirmPasswordReset,
  deleteUser,
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

export const changeFirebasePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No authenticated user found.");
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};

export const firebaseConfirmPasswordReset = async (oobCode, newPassword) => {
  await confirmPasswordReset(auth, oobCode, newPassword);
};

export const deleteFirebaseUser = async (user) => {
  if (!user) return;
  await deleteUser(user);
};
