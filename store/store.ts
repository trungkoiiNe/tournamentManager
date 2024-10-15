import { create } from "zustand";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { useAuthStore } from "./authStore";
import { alert } from "@baronha/ting";
interface TeamStats {
  P: number;
  W: number;
  D: number;
  L: number;
  GD: number;
  Pts: number;
}
interface GroupTeam extends Team {
  stats: TeamStats;
}

interface Group {
  name: string;
  teams: any[];
}
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
  groups?: any;
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
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addTournament: (
    tournament: Omit<Tournament, "id">,
    prizes: Prize[]
  ) => Promise<{ id: string }>;
  updateTournament: (
    tournament: Tournament,
    prizes: Prize[],
    schedules: any[],
    groups: any[]
  ) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  addTeam: (team: Omit<Team, "id">) => Promise<{ id: string }>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchTournaments: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchPrizes: (tournamentId: string) => Promise<Prize[]>;
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
  fetchTeamsSpecifiedCoachId: (coachId: string) => void;
  joinTournament: (tournamentId: string, teamId: string) => Promise<void>;
  registeredTeams: Team[];
  fetchRegisteredTeams: (tournamentId: string) => () => void;
  updateTournamentWithSchedule: (
    tournamentId: string,
    updatedTournament: Partial<Tournament>,
    demoSchedule: any[]
  ) => Promise<{ success: boolean; error?: any }>;
  generateDemoSchedule: (teams: Team[], format: string) => any[];
  updateMatchResult: (
    schedule: any[],
    matchIndex: number,
    team: "team1" | "team2",
    result: number
  ) => any[];
  setMatchTimestamp: (
    schedule: any[],
    matchIndex: number,
    timestamp: Date
  ) => any[];
  calculateNextMatches: (
    schedule: any[],
    currentRound: number
  ) => { updatedSchedule: any[]; nextRound: number; winner?: any };
  fetchTournamentSchedules: (tournamentId: string) => Promise<any[]>;
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
    try {
      await firestore().collection("TournamentManager").doc(id).delete();

      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));
      alert({
        title: "User Deleted",
        message: "The user has been deleted successfully.",
      });
    } catch (error) {
      alert({
        title: "Error",
        message: "Failed to delete user.",
      });
    }
  },

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
  }, // ... existing code ...

  //     updateTournament: async (
  //         tournament: Tournament,
  //         prizes: Prize[]
  //     ): Promise<void> => {
  //         set({isLoading: true, error: null});
  //         try {
  //             const tournamentRef = firestore()
  //                 .collection("tournaments")
  //                 .doc(tournament.id);
  //             const batch = firestore().batch();

  //             // Update tournament data
  //             batch.update(tournamentRef, tournament);

  //             // Update prizes
  //             const prizesCollection = tournamentRef.collection("prizes");
  //             const existingPrizesSnapshot = await prizesCollection.get();

  //             // Delete existing prizes
  //             existingPrizesSnapshot.docs.forEach((doc) => {
  //                 batch.delete(doc.ref);
  //             });

  //             // Add new prizes
  //             prizes.forEach((prize) => {
  //                 const newPrizeRef = prizesCollection.doc();
  //                 batch.set(newPrizeRef, prize);
  //             });

  //             await batch.commit();

  //             // Update local state
  //             set((state) => ({
  //                 tournaments: state.tournaments.map((t) =>
  //                     t.id === tournament.id ? tournament : t
  //                 ),
  //             }));
  //         } catch (error) {
  //             console.error("Error updating tournament:", error);
  //             set({error: "Failed to update tournament"});
  //             throw error;
  //         } finally {
  //             set({isLoading: false});
  //         }
  //   },
  //   updateTournament: async (
  //     tournament: Tournament,
  //     prizes: Prize[],
  //     schedules: any[],
  //     groups: any []
  //     // Add this parameter
  //   ): Promise<void> => {
  //     set({ isLoading: true, error: null });
  //     try {
  //       const tournamentRef = firestore()
  //         .collection("tournaments")
  //         .doc(tournament.id);
  //       const batch = firestore().batch();
  //       batch.update(tournamentRef, {
  //         ...tournament,
  //         groups: groups.reduce((acc, group) => {
  //           acc[group.name] = group.teams.map((team) => team.id);
  //           return acc;
  //         }, {}),
  //       });

  //       // Update tournament data
  //       batch.update(tournamentRef, tournament);

  //       // Update prizes
  //       const prizesCollection = tournamentRef.collection("prizes");
  //       const existingPrizesSnapshot = await prizesCollection.get();

  //       // Delete existing prizes
  //       existingPrizesSnapshot.docs.forEach((doc) => {
  //         batch.delete(doc.ref);
  //       });

  //       // Add new prizes
  //       prizes.forEach((prize) => {
  //         const newPrizeRef = prizesCollection.doc();
  //         batch.set(newPrizeRef, prize);
  //       });

  //       // Update schedules
  //       const schedulesCollection = tournamentRef.collection("schedules");
  //       const existingSchedulesSnapshot = await schedulesCollection.get();

  //       // Delete existing schedules
  //       existingSchedulesSnapshot.docs.forEach((doc) => {
  //         batch.delete(doc.ref);
  //       });

  //       // Add new schedules
  //       schedules.forEach((schedule) => {
  //         const newScheduleRef = schedulesCollection.doc();
  //         batch.set(newScheduleRef, schedule);
  //       });

  //       await batch.commit();

  //       // Update local state
  //       set((state) => ({
  //         tournaments: state.tournaments.map((t) =>
  //           t.id === tournament.id ? { ...tournament, groups: groups } : t
  //         ),
  //       }));
  //     } catch (error) {
  //       console.error("Error updating tournament:", error);
  //       set({ error: "Failed to update tournament" });
  //       throw error;
  //     } finally {
  //       set({ isLoading: false });
  //     }
  //   },
  //   updateTournament: async (
  //     tournament: Tournament,
  //     prizes: Prize[],
  //     schedules: any[],
  //     groups: { [groupName: string]: { [teamId: string]: Team } }
  //   ): Promise<void> => {
  //     set({ isLoading: true, error: null });
  //     try {
  //       const tournamentRef = firestore()
  //         .collection("tournaments")
  //         .doc(tournament.id);
  //       const batch = firestore().batch();
  //       batch.update(tournamentRef, {
  //         ...tournament,
  //         groups: Object.entries(groups).reduce(
  //           (acc, [groupName, groupTeams]) => {
  //             acc[groupName] = Object.keys(groupTeams);
  //             return acc;
  //           },
  //           {}
  //         ),
  //       });

  //       // Update tournament data
  //       batch.update(tournamentRef, tournament);

  //       // Update prizes
  //       const prizesCollection = tournamentRef.collection("prizes");
  //       const existingPrizesSnapshot = await prizesCollection.get();

  //       // Delete existing prizes
  //       existingPrizesSnapshot.docs.forEach((doc) => {
  //         batch.delete(doc.ref);
  //       });

  //       // Add new prizes
  //       prizes.forEach((prize) => {
  //         const newPrizeRef = prizesCollection.doc();
  //         batch.set(newPrizeRef, prize);
  //       });

  //       // Update schedules
  //       const schedulesCollection = tournamentRef.collection("schedules");
  //       const existingSchedulesSnapshot = await schedulesCollection.get();

  //       // Delete existing schedules
  //       existingSchedulesSnapshot.docs.forEach((doc) => {
  //         batch.delete(doc.ref);
  //       });

  //       // Add new schedules
  //       schedules.forEach((schedule) => {
  //         const newScheduleRef = schedulesCollection.doc();
  //         batch.set(newScheduleRef, schedule);
  //       });

  //       await batch.commit();

  //       // Update local state
  //       set((state) => ({
  //         tournaments: state.tournaments.map((t) =>
  //           t.id === tournament.id ? { ...tournament, groups } : t
  //         ),
  //       }));
  //     } catch (error) {
  //       console.error("Error updating tournament:", error);
  //       set({ error: "Failed to update tournament" });
  //       throw error;
  //     } finally {
  //       set({ isLoading: false });
  //     }
  //   },
  updateTournament: async (
    tournament: Tournament,
    prizes: Prize[],
    schedules: any[],
    groups: any[]
  ): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const tournamentRef = firestore()
        .collection("tournaments")
        .doc(tournament.id);
      const batch = firestore().batch();

      // Update tournament data including groups with team stats
      const updatedGroups = groups.reduce((acc: any, group: any) => {
        acc[group.name] = group.teams.reduce((teamAcc: any, team: any) => {
          if (team?.id && team?.teamName) {
            teamAcc[team.id] = {
              id: team.id,
              teamName: team.teamName,
              stats: team.stats || {},
            };
          }
          return teamAcc;
        }, {});
        return acc;
      }, {} as { [groupName: string]: { [teamId: string]: GroupTeam } });

      // Remove undefined values from tournament object
      const cleanTournament = Object.entries(tournament).reduce(
        (acc: any, [key, value]: any) => {
          if (value !== undefined) {
            acc[key]  = value;
          }
          return acc;
        },
        {} as Tournament
      );

      batch.update(tournamentRef, {
        ...cleanTournament,
        groups: updatedGroups,
      });

      // Update prizes
      const prizesCollection = tournamentRef.collection("prizes");
      const existingPrizesSnapshot = await prizesCollection.get();

      existingPrizesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      prizes.forEach((prize) => {
        if (prize.category && prize.numberOfPrizes && prize.moneyPerPrize) {
          const newPrizeRef = prizesCollection.doc();
          batch.set(newPrizeRef, prize);
        }
      });

      // Update schedules
      const schedulesCollection = tournamentRef.collection("schedules");
      const existingSchedulesSnapshot = await schedulesCollection.get();

      existingSchedulesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      schedules.forEach((schedule) => {
        if (schedule) {
          const newScheduleRef = schedulesCollection.doc();
          batch.set(newScheduleRef, schedule);
        }
      });

      await batch.commit();

      // Update local state
      set((state) => ({
        tournaments: state.tournaments.map((t) =>
          t.id === tournament.id
            ? { ...cleanTournament, groups: updatedGroups }
            : t
        ),
      }));
    } catch (error) {
      console.error("Error updating tournament:", error);
      set({ error: "Failed to update tournament" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // ... rest of the code ...
  deleteTournament: async (id) => {
    await firestore().collection("tournaments").doc(id).delete();
    set((state) => ({
      tournaments: state.tournaments.filter((t) => t.id !== id),
    }));
  },

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
        .get();

      const invitations = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as PendingPlayer)
      );
      set({ pendingInvitations: invitations });
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
    }
  },

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

        // Check if the team is already in the tournament
        if (tournamentData.teams && tournamentData.teams.includes(teamId)) {
          // Alert.alert("Error", "Team has already joined this tournament");
          throw new Error("Team has already joined this tournament");
        }

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
      // console.error("Error joining tournament:", error);
      throw error;
    }
  },
  // ... (rest of the code remains the same)
  registeredTeams: [],

  fetchRegisteredTeams: (tournamentId: string) => {
    const unsubscribe = firestore()
      .collection("tournaments")
      .doc(tournamentId)
      .onSnapshot(async (tournamentDoc) => {
        const tournamentData = tournamentDoc.data() as Tournament;
        if (!tournamentData || !tournamentData.teams) {
          set({ registeredTeams: [] });
          return;
        }

        try {
          const teamPromises = tournamentData.teams.map((teamId) =>
            firestore().collection("teams").doc(teamId).get()
          );
          const teamDocs = await Promise.all(teamPromises);
          const teams = teamDocs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Team)
          );
          set({ registeredTeams: teams });
        } catch (error) {
          console.error("Error fetching registered teams:", error);
          set({ error: "Failed to fetch registered teams" });
        }
      });

    return unsubscribe;
  },
  updateTournamentWithSchedule: async (
    tournamentId: string,
    updatedTournament: Partial<Tournament>,
    demoSchedule: any[]
  ) => {
    set({ isLoading: true, error: null });
    try {
      const tournamentRef = firestore()
        .collection("tournaments")
        .doc(tournamentId);

      // Update tournament data
      await tournamentRef.update(updatedTournament);

      // Add schedule to a subcollection
      const scheduleCollection = tournamentRef.collection("schedules");
      const batch = firestore().batch();

      demoSchedule.forEach((match) => {
        const matchRef = scheduleCollection.doc();
        batch.set(matchRef, {
          round: match.round,
          team1Id: match.team1.id,
          team2Id: match.team2.id,
          team1Result: match.team1Result,
          team2Result: match.team2Result,
          timestamp: match.timestamp
            ? firestore.Timestamp.fromDate(match.timestamp)
            : null,
          // Add any other relevant fields here
        });
      });

      await batch.commit();

      // Update local state
      set((state) => ({
        tournaments: state.tournaments.map((t) =>
          t.id === tournamentId ? { ...t, ...updatedTournament } : t
        ),
      }));

      return { success: true };
    } catch (error) {
      console.error("Error updating tournament with schedule:", error);
      set({ error: "Failed to update tournament with schedule" });
      return { success: false, error };
    } finally {
      set({ isLoading: false });
    }
  },

  generateDemoSchedule: (teams: Team[], format: string): any[] => {
    if (teams.length < 2) {
      throw new Error("Not enough teams to generate a schedule");
    }

    let schedule = [];

    if (format === "knockout") {
      schedule = generateKnockoutSchedule(teams);
    } else if (format === "groupKnockout") {
      schedule = generateGroupKnockoutSchedule(teams);
    } else {
      // Default to round-robin if format is not specified or unsupported
      schedule = generateRoundRobinSchedule(teams);
    }

    return schedule;
  },

  updateMatchResult: (
    schedule: any[],
    matchIndex: number,
    team: "team1" | "team2",
    result: number
  ) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[matchIndex][`${team}Result`] = result;
    return updatedSchedule;
  },

  setMatchTimestamp: (schedule: any[], matchIndex: number, timestamp: Date) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[matchIndex].timestamp = timestamp;
    return updatedSchedule;
  },

  calculateNextMatches: (schedule: any[], currentRound: number) => {
    const currentMatches = schedule.filter(
      (match) => match.round === currentRound
    );
    const winners = currentMatches
      .filter(
        (match) => match.team1Result !== null && match.team2Result !== null
      )
      .map((match) =>
        match.team1Result > match.team2Result ? match.team1 : match.team2
      );

    if (winners.length > 1) {
      const nextRound = currentRound + 1;
      const nextRoundMatches = [];

      for (let i = 0; i < winners.length; i += 2) {
        if (i + 1 < winners.length) {
          nextRoundMatches.push({
            round: nextRound,
            team1: winners[i],
            team2: winners[i + 1],
            team1Result: null,
            team2Result: null,
            timestamp: null,
          });
        } else {
          nextRoundMatches.push({
            round: nextRound,
            team1: winners[i],
            team2: { id: "bye", teamName: "BYE" },
            team1Result: null,
            team2Result: null,
            timestamp: null,
          });
        }
      }

      return { updatedSchedule: [...schedule, ...nextRoundMatches], nextRound };
    } else {
      return {
        updatedSchedule: schedule,
        nextRound: currentRound,
        winner: winners[0],
      };
    }
  },
  fetchTournamentSchedules: async (tournamentId: string): Promise<any[]> => {
    set({ isLoading: true, error: null });
    try {
      const scheduleSnapshot = await firestore()
        .collection("tournaments")
        .doc(tournamentId)
        .collection("schedules")
        .get();

      const schedules = scheduleSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          group: data.group,
          round: data.round,
          score1: data.score1,
          score2: data.score2,
          team1: data.team1,
          team2: data.team2,
          timestamp: data.timestamp ? data.timestamp.toDate() : null,
        };
      });

      return schedules;
    } catch (error) {
      console.error("Error fetching tournament schedules:", error);
      set({ error: "Failed to fetch tournament schedules" });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
}));
const generateRoundRobinSchedule = (teams: Team[]) => {
  let schedule = [];
  for (let i = 0; i < teams.length - 1; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      schedule.push({
        round: i + 1,
        team1: teams[i],
        team2: teams[j],
        team1Result: null,
        team2Result: null,
        timestamp: null,
      });
    }
  }
  return schedule;
};

const generateKnockoutSchedule = (teams: Team[]): any[] => {
  let schedule: any[] = [];
  let round = 1;
  let remainingTeams = [...teams];

  while (remainingTeams.length > 1) {
    let roundMatches = [];
    for (let i = 0; i < remainingTeams.length; i += 2) {
      if (i + 1 < remainingTeams.length) {
        roundMatches.push({
          round: round,
          team1: remainingTeams[i],
          team2: remainingTeams[i + 1],
          team1Result: null,
          team2Result: null,
          timestamp: null,
        });
      } else {
        roundMatches.push({
          round: round,
          team1: remainingTeams[i],
          team2: { id: "bye", teamName: "BYE" },
          team1Result: null,
          team2Result: null,
          timestamp: null,
        });
      }
    }
    schedule = [...schedule, ...roundMatches];
    remainingTeams = remainingTeams.filter((_, index) => index % 2 === 0);
    round++;
  }

  return schedule;
};

const generateGroupKnockoutSchedule = (teams: Team[]): any[] => {
  // ... (implementation)
  const numberOfGroups = Math.min(Math.floor(teams.length / 3), 4);
  const groups = Array.from({ length: numberOfGroups }, (_, i) => ({
    name: String.fromCharCode(65 + i),
    teams: [] as any,
  }));

  // Distribute teams to groups
  teams.forEach((team, index) => {
    groups[index % numberOfGroups].teams.push(team);
  });

  // Generate group stage matches
  const groupStage = groups.flatMap((group) =>
    generateRoundRobinSchedule(group.teams).map((match) => ({
      ...match,
      group: group.name,
    }))
  );

  // Generate knockout stage (simplified)
  const knockoutTeams = groups.flatMap((group) => group.teams.slice(0, 2));
  const knockoutStage = generateKnockoutSchedule(knockoutTeams);

  return [...groupStage, ...knockoutStage];
};
