import { create } from "zustand";
import firestore from "@react-native-firebase/firestore";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import storage from "@react-native-firebase/storage";
import { useAuthStore } from "./authStore";
interface User {
  id: string;
  role: string;
  name: string;
  teamId: string;
  stats: any;
  email: string;
}
interface Prize {
  id?: string;
  category: string;
  numberOfPrizes: number;
  moneyPerPrize: number;
}
interface PendingPlayer {
  id: string;
  playerId: string;
  teamId: string;
  status: "Pending" | "Approved" | "Declined";
  type: "invited" | "requested";
  timestamp: any;
}
interface Tournament {
  id: string;
  name: string;
  purpose: string;
  numberOfTeams: number;
  startDate: string;
  endDate: string;
  location: string;
  format: string;
  budget: number;
  organizers: string[];
  sponsors: string[];
  teams: string[];
  schedule: any;
  scores: any;
  bannerUrl: any;
  logoUrl: any;
  maxPlayersPerTeam: any;
  maxCoaches: any;
  roundsPerMatch: any;
  timePerRound: any;
}

interface Team {
  id: string;
  teamName: string;
  players: string[];
  coachId: string;
  schedule: any;
  avatar?: string; // Add avatar property
  tournaments?: string[];
}

interface Store {
  users: User[];
  tournaments: Tournament[];
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  // fetchUsers: () => void;
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  // fetchTournaments: () => void;
  addTournament: (
    tournament: Omit<Tournament, "id">,
    prizes: Prize[]
  ) => Promise<{ id: string }>;
  updateTournament: (tournament: Tournament) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  // fetchTeams: () => void;
  addTeam: (team: Omit<Team, "id">) => Promise<{ id: string }>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  // fetchTeamsSpecifiedCoachId: (coachId: string) => void;
  // fetchPrizes: (tournamentId: string) => Promise<Prize[]>;
  fetchUsers: () => Promise<void>;
  fetchTournaments: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  // fetchTeamsForCoach: (coachId: string) => Promise<void>;
  fetchPrizes: (tournamentId: string) => Promise<Prize[]>;
  // searchTournaments: (query: string) => Promise<Tournament[]>;
  // registerUserForTournament: (
  //   userId: string,
  //   tournamentId: string
  // ) => Promise<void>;
  // getTournamentStats: (tournamentId: string) => Promise<any>;
  uploadTournamentImages: (
    tournamentId: string,
    bannerPath?: string,
    logoPath?: string
  ) => Promise<void>;
  uploadTeamImages: (
    teamId: string,
    logoPath?: string,
    bannerPath?: string
  ) => Promise<void>;
  fetchTeamMembers: (teamId: string) => Promise<User[]>;
  invitePlayersToTeam: (teamId: string, playerIds: string[]) => Promise<void>;
  fetchAllPlayers: () => Promise<User[]>;
  pendingInvitations: PendingPlayer[];
  fetchPendingInvitations: () => Promise<void>;
  respondToInvitation: (
    invitationId: string,
    response: "Approved" | "Declined"
  ) => Promise<void>;
  // fetchTeamsSpecifiedCoachId: (coachId: string) => Promise<Team[]>;
  fetchTeamsSpecifiedCoachId: (coachId: string) => void;
  joinTournament: (tournamentId: string, teamId: string) => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  pendingInvitations: [],

  users: [],
  tournaments: [],
  teams: [],
  isLoading: false,
  error: null,
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  fetchUsers: async () => {
    set({ isLoading: true, error: null }); // Set loading state before fetching
    try {
      const snapshot = await firestore().collection("TournamentManager").get(); // Assuming users are stored in a 'users' collection
      const users = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as User)
      );
      set({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ error: "Failed to fetch users" });
    } finally {
      set({ isLoading: false }); // Set loading state after fetching, regardless of success or failure
    }
  },

  addUser: async (user) => {
    const docRef = await firestore().collection("TournamentManager").add(user);
    set((state) => ({
      users: [...state.users, { id: docRef.id, ...user }],
    }));
  },

  updateUser: async (user) => {
    await firestore().collection("TournamentManager").doc(user.id).update(user);
    set((state) => ({
      users: state.users.map((u) => (u.id === user.id ? user : u)),
    }));
  },

  deleteUser: async (id) => {
    await firestore().collection("TournamentManager").doc(id).delete();
    set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
  },

  // fetchTournaments: () => {
  //   return firestore()
  //     .collection("tournaments")
  //     .onSnapshot((querySnapshot) => {
  //       const tournaments = querySnapshot.docs.map(
  //         (doc) => ({ id: doc.id, ...doc.data() } as Tournament)
  //       );
  //       set({ tournaments });
  //     });
  // },

  fetchTournaments: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await firestore().collection("tournaments").get();
      const tournaments = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Tournament)
      );
      set({ tournaments });
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      set({ error: "Failed to fetch tournaments" });
    } finally {
      set({ isLoading: false });
    }
  },

  // addTournament: async (tournament) => {
  //   const docRef = await firestore().collection("tournaments").add(tournament);
  //   set((state) => ({
  //     tournaments: [...state.tournaments, { id: docRef.id, ...tournament }],
  //   }));
  // },
  // addTournament: async (tournament, prizes: Prize[]) => {
  //   const tournamentRef = await firestore()
  //     .collection("tournaments")
  //     .add(tournament);

  //   // Add prizes as a sub-collection
  //   const prizesCollection = tournamentRef.collection("prizes");
  //   for (const prize of prizes) {
  //     await prizesCollection.add({
  //       category: prize.category,
  //       numberOfPrizes: prize.numberOfPrizes,
  //       moneyPerPrize: prize.moneyPerPrize,
  //     });
  //   }

  //   set((state) => ({
  //     tournaments: [
  //       ...state.tournaments,
  //       { id: tournamentRef.id, ...tournament },
  //     ],
  //   }));
  // },
  addTournament: async (
    tournament: Omit<Tournament, "id">,
    prizes: Prize[]
  ): Promise<{ id: string }> => {
    set({ isLoading: true, error: null });
    try {
      const tournamentRef = await firestore()
        .collection("tournaments")
        .add(tournament);
      const tournamentId = tournamentRef.id;
      const prizesCollection = tournamentRef.collection("prizes");
      await Promise.all(prizes.map((prize) => prizesCollection.add(prize)));
      set((state) => ({
        tournaments: [
          ...state.tournaments,
          { id: tournamentId, ...tournament },
        ],
      }));
      return { id: tournamentId };
    } catch (error) {
      console.error("Error in addTournament:", error);
      set({ error: "Failed to add tournament" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  updateTournament: async (tournament) => {
    await firestore()
      .collection("tournaments")
      .doc(tournament.id)
      .update(tournament);
    set((state) => ({
      tournaments: state.tournaments.map((t) =>
        t.id === tournament.id ? tournament : t
      ),
    }));
  },

  deleteTournament: async (id) => {
    await firestore().collection("tournaments").doc(id).delete();
    set((state) => ({
      tournaments: state.tournaments.filter((t) => t.id !== id),
    }));
  },

  // fetchTeams: () => {
  //   return firestore()
  //     .collection("teams")
  //     .onSnapshot((querySnapshot) => {
  //       const teams = querySnapshot.docs.map(
  //         (doc) => ({ id: doc.id, ...doc.data() } as Team)
  //       );
  //       set({ teams });
  //     });
  // },
  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await firestore().collection("teams").get();
      const teams = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Team)
      );
      set({ teams });
    } catch (error) {
      console.error("Error fetching teams:", error);
      set({ error: "Failed to fetch teams" });
    } finally {
      set({ isLoading: false });
    }
  },
  // fetchTeamsSpecifiedCoachId: async (coachId: string) => {
  //   try {
  //     const snapshot = await firestore()
  //       .collection("teams")
  //       .where("coachId", "==", coachId)
  //       .get();
  //     // console.log(snapshot.docs);
  //     return snapshot.docs.map(
  //       (doc) => ({ id: doc.id, ...doc.data() } as Team)
  //     );

  //   } catch (error) {
  //     console.error("Error fetching coach's teams:", error);
  //     throw error;
  //   }
  // },
  // ... existing code ...

  fetchTeamsSpecifiedCoachId: async (coachId) => {
    return firestore()
      .collection("teams")
      .where("coachId", "==", coachId)
      .onSnapshot((querySnapshot) => {
        const teams = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Team)
        );
        set({ teams });
      });
  },

  // ... rest of the code ...
  addTeam: async (team: Omit<Team, "id">): Promise<{ id: string }> => {
    try {
      const docRef = await firestore().collection("teams").add(team);
      const newTeam = { id: docRef.id, ...team };
      set((state) => ({
        teams: [...state.teams, newTeam],
      }));
      return { id: docRef.id };
    } catch (error) {
      console.error("Error in addTeam:", error);
      throw error;
    }
  },

  updateTeam: async (team) => {
    await firestore().collection("teams").doc(team.id).update(team);
    set((state) => ({
      teams: state.teams.map((t) => (t.id === team.id ? team : t)),
    }));
  },

  deleteTeam: async (id) => {
    await firestore().collection("teams").doc(id).delete();
    set((state) => ({ teams: state.teams.filter((t) => t.id !== id) }));
  },
  // fetchPrizes: async (tournamentId: string): Promise<Prize[]> => {
  //   const prizesSnapshot = await firestore()
  //     .collection("tournaments")
  //     .doc(tournamentId)
  //     .collection("prizes")
  //     .get();

  //   return prizesSnapshot.docs.map(
  //     (doc) =>
  //       ({
  //         id: doc.id,
  //         ...doc.data(),
  //       } as Prize)
  //   );
  // },
  fetchPrizes: async (tournamentId: string): Promise<Prize[]> => {
    set({ isLoading: true, error: null });
    try {
      const snapshot = await firestore()
        .collection("tournaments")
        .doc(tournamentId)
        .collection("prizes")
        .get();
      const prizes = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Prize)
      );
      return prizes;
    } catch (error) {
      console.error("Error fetching prizes:", error);
      set({ error: "Failed to fetch prizes" });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  uploadTournamentImages: async (
    tournamentId: string,
    bannerPath?: string,
    logoPath?: string
  ): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const updates: { bannerUrl?: string; logoUrl?: string } = {};

      if (bannerPath) {
        const bannerFilename = `tournaments/${tournamentId}_banner_${Date.now()}.jpg`;
        const bannerRef = storage().ref(bannerFilename);
        await bannerRef.putFile(bannerPath);
        updates.bannerUrl = await bannerRef.getDownloadURL();
      }

      if (logoPath) {
        const logoFilename = `tournaments/${tournamentId}_logo_${Date.now()}.jpg`;
        const logoRef = storage().ref(logoFilename);
        await logoRef.putFile(logoPath);
        updates.logoUrl = await logoRef.getDownloadURL();
      }

      if (Object.keys(updates).length > 0) {
        await firestore()
          .collection("tournaments")
          .doc(tournamentId)
          .update(updates);
        set((state) => ({
          tournaments: state.tournaments.map((t) =>
            t.id === tournamentId ? { ...t, ...updates } : t
          ),
        }));
      }
    } catch (error) {
      console.error("Error uploading tournament images:", error);
      set({ error: "Failed to upload tournament images" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  uploadTeamImages: async (
    teamId: string,
    logoPath?: string,
    bannerPath?: string
  ): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const updates: { logoUrl?: string; bannerUrl?: string } = {};

      if (logoPath) {
        const logoFilename = `teams/${teamId}_logo_${Date.now()}.jpg`;
        const logoRef = storage().ref(logoFilename);
        await logoRef.putFile(logoPath);
        updates.logoUrl = await logoRef.getDownloadURL();
      }

      if (bannerPath) {
        const bannerFilename = `teams/${teamId}_banner_${Date.now()}.jpg`;
        const bannerRef = storage().ref(bannerFilename);
        await bannerRef.putFile(bannerPath);
        updates.bannerUrl = await bannerRef.getDownloadURL();
      }

      if (Object.keys(updates).length > 0) {
        await firestore().collection("teams").doc(teamId).update(updates);
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === teamId ? { ...t, ...updates } : t
          ),
        }));
      }
    } catch (error) {
      console.error("Error uploading team images:", error);
      set({ error: "Failed to upload team images" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  fetchTeamMembers: async (teamId: string): Promise<User[]> => {
    try {
      const teamDoc = await firestore().collection("teams").doc(teamId).get();
      const teamData = teamDoc.data();
      if (!teamData || !teamData.players) {
        return [];
      }
      const memberPromises = teamData.players.map((playerId: string) =>
        firestore().collection("TournamentManager").doc(playerId).get()
      );
      const memberDocs = await Promise.all(memberPromises);
      return memberDocs.map((doc) => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
  },
  // ... (previous code remains the same)

  invitePlayersToTeam: async (
    teamId: string,
    playerIds: string[]
  ): Promise<void> => {
    try {
      const batch = firestore().batch();
      const pendingPlayersRef = firestore().collection("pendingPlayers");

      playerIds.forEach((playerId) => {
        const newPendingPlayerRef = pendingPlayersRef.doc();
        batch.set(newPendingPlayerRef, {
          playerId: playerId,
          teamId: teamId,
          status: "Pending",
          type: "invited",
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error inviting players:", error);
      throw error;
    }
  },

  // ... (rest of the code remains the same)
  fetchAllPlayers: async (): Promise<User[]> => {
    try {
      const snapshot = await firestore()
        .collection("TournamentManager")
        .where("role", "==", "player")
        .get();
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as User)
      );
    } catch (error) {
      console.error("Error fetching players:", error);
      throw error;
    }
  },
  fetchPendingInvitations: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const snapshot = await firestore()
        .collection("pendingPlayers")
        .where("playerId", "==", user.email)
        // .where("status", "==", "Pending")
        .get();

      const invitations = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as PendingPlayer)
      );
      set({ pendingInvitations: invitations });
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
    }
  },
  // ... (previous code remains the same)

  respondToInvitation: async (
    invitationId: string,
    response: "Approved" | "Declined"
  ) => {
    try {
      const invitationRef = firestore()
        .collection("pendingPlayers")
        .doc(invitationId);
      const invitationDoc = await invitationRef.get();
      const invitationData = invitationDoc.data() as PendingPlayer;

      if (!invitationData) {
        throw new Error("Invitation not found");
      }

      await invitationRef.update({ status: response });

      if (response === "Approved") {
        const teamRef = firestore()
          .collection("teams")
          .doc(invitationData.teamId);
        const userRef = firestore()
          .collection("TournamentManager")
          .doc(invitationData.playerId);

        await firestore().runTransaction(async (transaction) => {
          const teamDoc = await transaction.get(teamRef);
          if (!teamDoc.exists) {
            throw new Error("Team not found");
          }
          const teamData = teamDoc.data() as Team;
          const updatedPlayers = [
            ...(teamData.players || []),
            invitationData.playerId,
          ];
          transaction.update(teamRef, { players: updatedPlayers });

          // Update the user's teamId in the TournamentManager collection
          transaction.update(userRef, { teamId: invitationData.teamId });
        });
      }

      set((state) => ({
        pendingInvitations: state.pendingInvitations.map((inv) =>
          inv.id === invitationId ? { ...inv, status: response } : inv
        ),
      }));

      // Fetch updated team data and user data
      if (response === "Approved") {
        await get().fetchTeams();
        await get().fetchUsers();
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
      throw error;
    }
  },

  joinTournament: async (tournamentId: string, teamId: string) => {
    try {
      const teamRef = firestore().collection("teams").doc(teamId);
      const tournamentRef = firestore()
        .collection("tournaments")
        .doc(tournamentId);

      await firestore().runTransaction(async (transaction) => {
        const teamDoc = await transaction.get(teamRef);
        const tournamentDoc = await transaction.get(tournamentRef);

        if (!teamDoc.exists || !tournamentDoc.exists) {
          throw new Error("Team or Tournament not found");
        }

        const teamData = teamDoc.data() as Team;
        const tournamentData = tournamentDoc.data() as Tournament;

        const updatedTeamTournaments = [
          ...(teamData.tournaments || []),
          tournamentId,
        ];
        const updatedTournamentTeams = [
          ...(tournamentData.teams || []),
          teamId,
        ];

        transaction.update(teamRef, { tournaments: updatedTeamTournaments });
        transaction.update(tournamentRef, { teams: updatedTournamentTeams });
      });

      // Update local state
      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === teamId
            ? {
                ...team,
                tournaments: [...(team.tournaments || []), tournamentId],
              }
            : team
        ),
        tournaments: state.tournaments.map((tournament) =>
          tournament.id === tournamentId
            ? { ...tournament, teams: [...(tournament.teams || []), teamId] }
            : tournament
        ),
      }));
    } catch (error) {
      console.error("Error joining tournament:", error);
      throw error;
    }
  },
  // ... (rest of the code remains the same)
}));
