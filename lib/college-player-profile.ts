import { mockPlayers, type MockPlayer } from "./mock-players";
import { defaultProfileStrength, type ProfileStrength } from "./profile-strength";

export type ProfileVideo = {
  id: string;
  title: string;
  duration: string;
};

export type TournamentResult = {
  id: string;
  title: string;
  year: string;
  description: string;
};

export type ProfileDocument = {
  id: string;
  name: string;
  status: "available" | "missing";
};

export type CollegePlayerProfile = MockPlayer & {
  age: number;
  currentSchool: string;
  about: string;
  academics: {
    highSchool: string;
    graduationDate: string;
    gpa: string;
    sat: string;
    act: string;
    toefl: string;
    ielts: string;
    duolingo: string;
    intendedMajor: string;
  };
  tennis: {
    utr: string;
    itfRanking: string;
    nationalRanking: string;
    ustaRanking: string;
    preferredDivision: string;
    playingStyle: string;
    dominantHand: string;
    height: string;
  };
  videos: ProfileVideo[];
  tournaments: TournamentResult[];
  documents: ProfileDocument[];
  coachNotes: string[];
  profileStrength: ProfileStrength;
};

const profileExtensions: Record<
  string,
  Omit<CollegePlayerProfile, keyof MockPlayer>
> = {
  "1": {
    age: 18,
    currentSchool: "Tokyo International School",
    about:
      "I am an internationally competitive tennis player seeking NCAA Division I opportunities. My goal is to compete at the highest collegiate level while pursuing a degree in Business Administration. I have trained across Asia and the United States, competing in ITF Junior and USTA Level 1 events.",
    academics: {
      highSchool: "Tokyo International School",
      graduationDate: "June 2027",
      gpa: "3.8 / 4.0",
      sat: "1420",
      act: "31",
      toefl: "108",
      ielts: "7.5",
      duolingo: "130",
      intendedMajor: "Business Administration",
    },
    tennis: {
      utr: "11.2",
      itfRanking: "#890",
      nationalRanking: "#8 (Japan)",
      ustaRanking: "#42 (Boys 18s)",
      preferredDivision: "NCAA Division I",
      playingStyle: "Aggressive Baseliner",
      dominantHand: "Right",
      height: "178 cm",
    },
    videos: [
      { id: "v1", title: "ITF Junior Final Highlights", duration: "3:24" },
      { id: "v2", title: "National Championship Match", duration: "5:12" },
      { id: "v3", title: "Training & Match Play Reel", duration: "4:08" },
    ],
    tournaments: [
      {
        id: "t1",
        title: "National Championship",
        year: "2025",
        description: "All-Japan Junior Championships — Boys 18 & Under Champion",
      },
      {
        id: "t2",
        title: "ITF Junior",
        year: "2024",
        description: "ITF J300 Osaka — Semifinalist",
      },
      {
        id: "t3",
        title: "USTA",
        year: "2024",
        description: "Easter Bowl — Quarterfinalist",
      },
      {
        id: "t4",
        title: "Regional Championship",
        year: "2023",
        description: "Kanto Regional Junior Championships — Champion",
      },
    ],
    documents: [
      { id: "transcript", name: "Transcript", status: "available" },
      {
        id: "test-scores",
        name: "Academic Test Scores",
        status: "available",
      },
    ],
    coachNotes: [
      "★★★★★ Prospect",
      "Interested",
      "Need updated transcript",
      "Follow up next month",
    ],
    profileStrength: defaultProfileStrength,
  },
  "2": {
    age: 19,
    currentSchool: "Osaka Tennis Academy",
    about:
      "Dedicated all-court player with strong results on the ITF circuit. Seeking a competitive NCAA D1 program with a rigorous economics curriculum.",
    academics: {
      highSchool: "Osaka Tennis Academy",
      graduationDate: "June 2026",
      gpa: "3.6 / 4.0",
      sat: "1380",
      act: "29",
      toefl: "102",
      ielts: "7.0",
      duolingo: "125",
      intendedMajor: "Economics",
    },
    tennis: {
      utr: "12.1",
      itfRanking: "#620",
      nationalRanking: "#3 (Japan)",
      ustaRanking: "#28 (Boys 18s)",
      preferredDivision: "NCAA Division I",
      playingStyle: "All-Court",
      dominantHand: "Right",
      height: "182 cm",
    },
    videos: [
      { id: "v1", title: "ITF J500 Match Highlights", duration: "4:15" },
      { id: "v2", title: "All-Japan Championships Final", duration: "6:02" },
      { id: "v3", title: "Serve & Return Analysis", duration: "3:45" },
    ],
    tournaments: [
      {
        id: "t1",
        title: "National Championship",
        year: "2025",
        description: "All-Japan Junior Championships — Finalist",
      },
      {
        id: "t2",
        title: "ITF Junior",
        year: "2025",
        description: "ITF J500 — Quarterfinalist",
      },
      {
        id: "t3",
        title: "USTA",
        year: "2024",
        description: "Orange Bowl — Round of 16",
      },
      {
        id: "t4",
        title: "Regional Championship",
        year: "2024",
        description: "Kansai Regional — Champion",
      },
    ],
    documents: [
      { id: "transcript", name: "Transcript", status: "available" },
      {
        id: "test-scores",
        name: "Academic Test Scores",
        status: "available",
      },
    ],
    coachNotes: [
      "★★★★★ Prospect",
      "High priority recruit",
      "Schedule campus visit",
    ],
    profileStrength: defaultProfileStrength,
  },
};

function buildDefaultExtension(player: MockPlayer): Omit<CollegePlayerProfile, keyof MockPlayer> {
  return {
    age: 18,
    currentSchool: `${player.country} Tennis Academy`,
    about: `${player.name} is a competitive international player targeting ${player.division} programs. Strong commitment to both athletics and academics with experience on regional and national circuits.`,
    academics: {
      highSchool: `${player.country} International School`,
      graduationDate: `June ${player.graduationYear}`,
      gpa: `${player.gpa.toFixed(1)} / 4.0`,
      sat: "—",
      act: "—",
      toefl: player.academicTest === "TOEFL" ? "100" : "—",
      ielts: player.academicTest === "IELTS" ? "7.0" : "—",
      duolingo:
        player.academicTest === "Duolingo English Test" ? "120" : "—",
      intendedMajor: player.major,
    },
    tennis: {
      utr: player.utr.toFixed(1),
      itfRanking: "—",
      nationalRanking: "—",
      ustaRanking: "—",
      preferredDivision: player.division.replace("NCAA ", "NCAA Division "),
      playingStyle: player.playingStyle,
      dominantHand: player.handedness,
      height: `${player.height} cm`,
    },
    videos: [
      { id: "v1", title: "Match Highlights Reel", duration: "3:30" },
      { id: "v2", title: "Tournament Final", duration: "4:45" },
      { id: "v3", title: "Training Session", duration: "2:55" },
    ],
    tournaments: [
      {
        id: "t1",
        title: "National Championship",
        year: "2024",
        description: "National junior circuit — Semifinalist",
      },
      {
        id: "t2",
        title: "ITF Junior",
        year: "2024",
        description: "Regional ITF event — Quarterfinalist",
      },
      {
        id: "t3",
        title: "USTA",
        year: "2023",
        description: "National junior tour — Round of 16",
      },
      {
        id: "t4",
        title: "Regional Championship",
        year: "2023",
        description: "Regional finals — Champion",
      },
    ],
    documents: [
      { id: "transcript", name: "Transcript", status: "available" },
      {
        id: "test-scores",
        name: "Academic Test Scores",
        status: "missing",
      },
    ],
    coachNotes: ["★★★★ Prospect", "Under review"],
    profileStrength: defaultProfileStrength,
  };
}

export function getCollegePlayerProfile(
  id: string,
): CollegePlayerProfile | null {
  const base = mockPlayers.find((p) => p.id === id);
  if (!base) return null;

  const extension = profileExtensions[id] ?? buildDefaultExtension(base);
  return { ...base, ...extension };
}

export function getAllCollegePlayerIds(): string[] {
  return mockPlayers.map((p) => p.id);
}
