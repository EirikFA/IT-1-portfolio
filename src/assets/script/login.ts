import { auth as fbAuth } from "firebase/app";

import { auth, ui } from "../../fb";

auth.onAuthStateChanged(user => {
  if (user) location.replace("/");
});

ui.start("#firebaseui-container", {
  signInOptions: [
    fbAuth.EmailAuthProvider.PROVIDER_ID
  ],
  signInSuccessUrl: location.origin
});
