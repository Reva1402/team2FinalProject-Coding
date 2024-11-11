import { firestore } from './firebaseConfig';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function getModerators() {
    try {
        const moderatorsRef = collection(firestore, 'users');
        const snapshot = await getDocs(moderatorsRef);
        const moderators = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.role === 'Moderator') {
                moderators.push({ id: doc.id, ...data });
            }
        });
        return moderators;
    } catch (error) {
        console.error("Error fetching moderators:", error);
        return [];
    }
}

export function viewModerator(id) {
    console.log(`View details for moderator with ID: ${id}`);
    // Add modal or navigation logic here
}

export function editModerator(id) {
    console.log(`Edit moderator with ID: ${id}`);
    // Add editing logic here
}

export async function demoteModerator(id) {
    const moderatorRef = doc(firestore, "users", id);
    try {
        await updateDoc(moderatorRef, {
            role: "Standard User", 
            isModerator: false 
        });
        console.log(`Moderator with ID: ${id} has been demoted`);
    } catch (error) {
        console.error("Error demoting moderator:", error);
    }
}

export async function suspendModerator(id) {
    const moderatorRef = doc(firestore, "users", id);
    try {
        await updateDoc(moderatorRef, { status: "Suspended" });
        console.log(`Moderator with ID: ${id} has been suspended`);
    } catch (error) {
        console.error("Error suspending moderator:", error);
    }
}

export async function deleteModerator(id) {
    const moderatorRef = doc(firestore, "users", id);
    try {
        await deleteDoc(moderatorRef);
        console.log(`Moderator with ID: ${id} has been deleted`);
    } catch (error) {
        console.error("Error deleting moderator:", error);
    }
}