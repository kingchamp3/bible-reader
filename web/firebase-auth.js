const config = window.FIREBASE_CONFIG || {};
const hasFirebaseConfig = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

window.BIBLE_READER_AUTH = {
  enabled: false,
  user: null,
  async login() {
    alert("Firebase 설정값을 먼저 입력해 주세요.");
  },
  async logout() {},
  async loadUserData() {
    return null;
  },
  async saveUserData() {},
  onAuthChanged(callback) {
    callback(null);
  },
};

window.BIBLE_READER_AUTH_READY = (async () => {
  if (!hasFirebaseConfig) {
    return window.BIBLE_READER_AUTH;
  }

  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js");
  const {
    GoogleAuthProvider,
    getAuth,
    onAuthStateChanged,
    signInWithPopup,
    signOut,
  } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
  const { doc, getDoc, getFirestore, setDoc } = await import(
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js"
  );

  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();

  window.BIBLE_READER_AUTH = {
    enabled: true,
    user: null,
    async login() {
      await signInWithPopup(auth, provider);
    },
    async logout() {
      await signOut(auth);
    },
    async loadUserData() {
      if (!auth.currentUser) return null;
      const snapshot = await getDoc(doc(db, "bibleReaderUsers", auth.currentUser.uid));
      return snapshot.exists() ? snapshot.data() : null;
    },
    async saveUserData(data) {
      if (!auth.currentUser) return;
      await setDoc(
        doc(db, "bibleReaderUsers", auth.currentUser.uid),
        {
          ...data,
          email: auth.currentUser.email,
          name: auth.currentUser.displayName,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    },
    onAuthChanged(callback) {
      onAuthStateChanged(auth, (user) => {
        this.user = user
          ? {
              uid: user.uid,
              name: user.displayName || user.email || "Google 사용자",
              email: user.email,
            }
          : null;
        callback(this.user);
      });
    },
  };

  return window.BIBLE_READER_AUTH;
})();
