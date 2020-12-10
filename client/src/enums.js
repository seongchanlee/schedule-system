const UserType = {
  PATIENT: "Patient",
  STAFF: "Staff",
  ADMIN: "Administrator"
}

const MenuTitle = {
  APPOINTMENTS: "APPOINTMENTS",
  REPORTS: "REPORTS",
  USERS: "USERS"
}

const TherapyType = {
  PT: "PT",
  PTRA: "PTRA",
  OT: "OT",
  OTRA: "OTRA",
  SLP: "SLP",
  SLPA: "SLPA",
  SW: "SW",
  SWA: "SWA",
  MUSIC: "Music",
  REC: "Rec",
  RD: "RD",
  RN: "RN",
  MD: "MD",
  PSYCH: "Psych",
  PSYCHIATRY: "Psychiatry",
  VOC: "Voc",
  SH: "S&H",
  PHARMACY: "Pharmacy",
  WOUND: "Wound",
  CML: "CML",
  TST: "TST",
  OTHER: "Other"
}

const THERAPIST_TYPE = Object.entries(TherapyType).map(entry =>
  ({ key: entry[0], value: entry[0], text: entry[1] }));

const TherapyTypeColour = {
  PT: "#e9a451",
  PTRA: "#69202f",
  OT: "#2c7972",
  OTRA: "#f6cd61",
  SLP: "#aec993",
  SLPA: "#eea990",
  SW: "#3e3d54",
  SWA: "#f6e0b5",
  MUSIC: "#8c646a",
  REC: "#2e4045",
  RD: "#4f5b66",
  RN: "#8caba8",
  MD: "#854442",
  PSYCH: "#b96332",
  PSYCHIATRY: "#d696bb",

  // Loop back from start at this point.
  // Invest into finding more colours, if necessary
  // for support for all therapy types.
  VOC: "#e9a451",
  SH: "#69202f",
  PHARMACY: "#2c7972",
  WOUND: "#f6cd61",
  CML: "#aec993",
  TST: "#eea990",
  OTHER: "#3e3d54",
  DEFAULT: "#265985"
}

if (Object.freeze) {
  Object.freeze(UserType);
  Object.freeze(MenuTitle);
  Object.freeze(TherapyType);
  Object.freeze(TherapyTypeColour);
}

module.exports = {
  UserType: UserType,
  MenuTitle: MenuTitle,
  TherapyType: TherapyType,
  TherapyTypeColour: TherapyTypeColour,
  THERAPIST_TYPE: THERAPIST_TYPE
}