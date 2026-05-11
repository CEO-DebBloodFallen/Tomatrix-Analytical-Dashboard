import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, child } from 'firebase/database';

const firebaseConfig = {
  authDomain: "solanirad-analytics-dashboard.firebaseapp.com",
  databaseURL: "https://solanirad-analytics-dashboard-default-rtdb.asia-southeast1.firebasedatabase.app/",
  storageBucket: "solanirad-analytics-dashboard.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function checkDb() {
  const historyRef = ref(db, 'sensor_history');
  const snapshot = await get(historyRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    console.log(JSON.stringify(data).substring(0, 500));
  } else {
    console.log("No data");
  }
  process.exit(0);
}
checkDb();
