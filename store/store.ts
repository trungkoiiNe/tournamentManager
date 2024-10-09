import { create } from "zustand";
import firestore from "@react-native-firebase/firestore";

interface User {
  id: string;
  role: string;
  name: string;
  teamId: string;
  stats: any;
  email: string;
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
}

interface Team {
  id: string;
  teamName: string;
  players: string[];
  coachId: string;
  schedule: any;
  avatar?: string; // Add avatar property
}

interface Store {
  users: User[];
  tournaments: Tournament[];
  teams: Team[];
  fetchUsers: () => void;
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  fetchTournaments: () => void;
  addTournament: (tournament: Omit<Tournament, "id">) => Promise<void>;
  updateTournament: (tournament: Tournament) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  fetchTeams: () => void;
  addTeam: (team: Omit<Team, "id">) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  fetchTeamsSpecifiedCoachId: (coachId: string) => void;
}

export const useStore = create<Store>((set) => ({
  users: [],
  tournaments: [],
  teams: [],

  fetchUsers: () => {
    return firestore()
      .collection("TournamentManager")
      .onSnapshot((querySnapshot) => {
        const users = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as User)
        );
        set({ users });
      });
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

  fetchTournaments: () => {
    return firestore()
      .collection("tournaments")
      .onSnapshot((querySnapshot) => {
        const tournaments = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Tournament)
        );
        set({ tournaments });
      });
  },

  addTournament: async (tournament) => {
    const docRef = await firestore().collection("tournaments").add(tournament);
    set((state) => ({
      tournaments: [...state.tournaments, { id: docRef.id, ...tournament }],
    }));
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

  fetchTeams: () => {
    return firestore()
      .collection("teams")
      .onSnapshot((querySnapshot) => {
        const teams = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Team)
        );
        set({ teams });
      });
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

  addTeam: async (team) => {
    const docRef = await firestore().collection("teams").add(team);
    set((state) => ({
      teams: [...state.teams, { id: docRef.id, ...team }],
    }));
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
}));
