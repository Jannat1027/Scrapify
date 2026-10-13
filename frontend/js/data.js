// Demo data the whole site runs on. Small builders, kept inside this closure, make each record one call.
const SEED = (() => {
  const daysAgo = (days) => new Date(Date.now() - days * 864e5).toISOString();

  const category = (id, name, note, icon) => ({ id, name, note, icon });

  const rate = (id, clean, light, heavy, source, age) => ({ id, clean, light, heavy, source, updated: daysAgo(age) });

  const user = (role) => (id, name, org, location, email, status, age) => ({
    id, name, org, role, location, email, status, joined: daysAgo(age),
  });
  const [operator, recycler, admin] = ["operator", "recycler", "admin"].map(user);

  const USERS = [
    operator("u1", "Rahima Begum", "Green Bin Scrap Shop", "Mirpur, Dhaka", "rahima@greenbin.bd", "approved", 120),
    operator("u2", "Karim Uddin", "BRAC Collection Point 4", "Bayezid, Chattogram", "karim@cp4.org", "approved", 90),
    operator("u3", "Shapla Akter", "Sonadanga Bhangari", "Sonadanga, Khulna", "shapla@bhangari.bd", "pending", 2),
    operator("u4", "Jamal Hossain", "City Scrap House", "Shaheb Bazar, Rajshahi", "jamal@cityscrap.bd", "flagged", 60),
    recycler("u5", "Tanvir Ahmed", "Polymer Loop Ltd.", "Kamrangirchar, Dhaka", "tanvir@polymerloop.com",
      "approved", 150),
    recycler("u6", "Nusrat Jahan", "ReForm Plastics", "Bayezid, Chattogram", "nusrat@reform.com.bd", "pending", 1),
    recycler("u7", "Arif Chowdhury", "EcoPellet BD", "Sonadanga, Khulna", "arif@ecopellet.bd", "suspended", 200),
    admin("u9", "Farhana Islam", "Scrapify", "Dhaka", "admin@scrapify.app", "approved", 300),
  ];

  // A scan takes its location from the operator who made it.
  const scan = (id, operatorId, age, weight, condition, confidence, quality, composition, corrected = false) => ({
    id, operatorId, weight, condition, confidence, quality, composition, corrected,
    location: USERS.find((u) => u.id === operatorId).location,
    date: daysAgo(age),
  });

  const SCANS = [
    scan("SC-1042", "u1", 0, 62, "clean", 0.91, "good", { pet: 60, hdpe: 25, film: 15 }),
    scan("SC-1039", "u1", 2, 38, "light", 0.84, "good", { hdpe: 70, pp: 30 }),
    scan("SC-1033", "u1", 5, 120, "light", 0.52, "dark", { film: 80, mixed: 20 }, true),
    scan("SC-1027", "u1", 9, 45, "clean", 0.88, "good", { pet: 90, pp: 10 }),
    scan("SC-1019", "u1", 14, 74, "heavy", 0.67, "blurry", { pp: 50, mixed: 50 }, true),
    scan("SC-1011", "u2", 3, 210, "clean", 0.93, "good", { pet: 100 }),
    scan("SC-1008", "u2", 11, 95, "light", 0.58, "good", { hdpe: 40, film: 60 }, true),
  ];

  // A listing copies its plastic type, condition, weight, place and date from the scan it came from.
  const listing = (id, scanId, price, status, extra = {}) => {
    const { operatorId, condition, weight, location, date, composition } = SCANS.find((s) => s.id === scanId);
    const [mainType] = Object.entries(composition).sort((a, b) => b[1] - a[1])[0];
    return {
      id, scanId, operatorId, condition, weight, location, price, status,
      category: mainType,
      created: date,
      ...extra,
    };
  };

  const report = (id, listingId, by, reason, status, age) => ({
    id, listingId, by, reason, status, date: daysAgo(age),
  });

  return {
    categories: [
      category("pet", "Clear PET", "Water and soft-drink bottles", "cup-soda"),
      category("hdpe", "Hard HDPE", "Detergent, oil and milk jugs", "milk"),
      category("pp", "PP containers", "Food tubs, caps, buckets", "package"),
      category("film", "LDPE film", "Carry bags and wrapping", "shopping-bag"),
      category("mixed", "Mixed / other", "Multi-layer or unknown", "shapes"),
    ],

    conditions: [
      { id: "clean", name: "Clean" },
      { id: "light", name: "Lightly soiled" },
      { id: "heavy", name: "Heavily soiled" },
    ],

    locations: [
      "Mirpur, Dhaka",
      "Kamrangirchar, Dhaka",
      "Bayezid, Chattogram",
      "Sonadanga, Khulna",
      "Shaheb Bazar, Rajshahi",
    ],

    rates: [
      rate("pet", 42, 34, 22, "Dhaka wholesale survey", 4),
      rate("hdpe", 48, 38, 25, "Kamrangirchar recycler quotes", 6),
      rate("pp", 36, 28, 18, "Kamrangirchar recycler quotes", 6),
      rate("film", 18, 12, 7, "NGO collection partners", 21),
      rate("mixed", 12, 8, 5, "Admin estimate", 17),
    ],

    users: USERS,
    scans: SCANS,

    listings: [
      listing("LS-2210", "SC-1042", 2300, "available"),
      listing("LS-2207", "SC-1039", 1340, "claimed", { recyclerId: "u5" }),
      listing("LS-2201", "SC-1027", 1850, "completed", { recyclerId: "u5", rating: 5 }),
      listing("LS-2196", "SC-1019", 950, "cancelled", {
        recyclerId: "u5", cancelReason: "Batch was wetter than shown",
      }),
      listing("LS-2209", "SC-1011", 8650, "available"),
      listing("LS-2203", "SC-1008", 1150, "available"),
    ],

    reports: [
      report("RP-31", "LS-2196", "u5", "Weight on pickup was about 15 kg less than listed.", "open", 13),
      report("RP-29", "LS-2207", "u1", "Recycler has not collected the batch for 2 days.", "open", 1),
      report("RP-24", "LS-2201", "u5", "Photo did not match the colour of the bottles.", "resolved", 8),
    ],
  };
})();
