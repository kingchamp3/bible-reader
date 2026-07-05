const config = window.FIREBASE_CONFIG || {};
const hasFirebaseConfig = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

window.BIBLE_READER_AUTH = {
  enabled: false,
  user: null,
  async login() {
    const reason = window.BIBLE_READER_AUTH_ERROR ? `\n\n사유: ${window.BIBLE_READER_AUTH_ERROR}` : "";
    alert(`Google 로그인을 준비하지 못했습니다.${reason}`);
  },
  async logout() {},
  async loadUserData() {
    return null;
  },
  async saveUserData() {},
  async loadGratitudeNotes() {
    return [];
  },
  async saveGratitudeNote() {
    throw new Error("감사 한줄 공유 기능을 사용할 수 없습니다.");
  },
  onAuthChanged(callback) {
    callback(null);
  },
};

window.BIBLE_READER_AUTH_READY = (async () => {
  if (!hasFirebaseConfig) {
    window.BIBLE_READER_AUTH_ERROR = "Firebase 설정값이 없습니다.";
    return window.BIBLE_READER_AUTH;
  }

  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js");
    const {
      GoogleAuthProvider,
      getAuth,
      onAuthStateChanged,
      signInWithPopup,
      signOut,
    } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
    const {
      addDoc,
      collection,
      doc,
      getDoc,
      getDocs,
      getFirestore,
      limit,
      orderBy,
      query,
      serverTimestamp,
      setDoc,
    } = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");

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
      async loadGratitudeNotes() {
        const snapshot = await getDocs(query(collection(db, "gratitudeNotes"), orderBy("createdAt", "desc"), limit(20)));
        return snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
      },
      async saveGratitudeNote(text) {
        if (!auth.currentUser) throw new Error("Google 로그인 후 감사 한줄을 나눌 수 있습니다.");
        const trimmed = text.trim().slice(0, 80);
        if (!trimmed) return;
        await addDoc(collection(db, "gratitudeNotes"), {
          text: trimmed,
          name: auth.currentUser.displayName || auth.currentUser.email || "익명",
          uid: auth.currentUser.uid,
          createdAt: serverTimestamp(),
        });
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
  } catch (error) {
    window.BIBLE_READER_AUTH_ERROR = error?.message || "Firebase 스크립트를 불러오지 못했습니다.";
    return window.BIBLE_READER_AUTH;
  }
})();
