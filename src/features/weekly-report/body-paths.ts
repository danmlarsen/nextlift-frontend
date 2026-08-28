// Stylized body diagrams for the muscle heatmap, drawn on a 200x440 grid
// with the figure centered at x=100. Paired regions are authored as the
// left-side shape only and rendered a second time mirrored across x=100
// (transform "translate(200,0) scale(-1,1)"); central regions (neck, abs,
// traps, lower back) are symmetric full-width shapes rendered once.

export type BodyView = "front" | "back";

export type BodyRegion = {
  muscle: string;
  d: string;
  mirror?: boolean;
};

type SilhouettePart = {
  d: string;
  mirror?: boolean;
};

// Shared by both views: head, torso, pelvis, one arm and one leg (mirrored).
export const SILHOUETTE_PATHS: SilhouettePart[] = [
  {
    // Head
    d: "M100 9 C110.5 9 117 18 117 30 C117 42 110.5 51 100 51 C89.5 51 83 42 83 30 C83 18 89.5 9 100 9 Z",
  },
  {
    // Neck + torso
    d: "M90 45 L110 45 C112 56 121 60 135 65 C145 69 147 80 145 95 C142 140 137 168 131 192 C126 208 114 214 100 214 C86 214 74 208 69 192 C63 168 58 140 55 95 C53 80 55 69 65 65 C79 60 88 56 90 45 Z",
  },
  {
    // Pelvis
    d: "M69 188 C84 200 116 200 131 188 C137 206 137 222 131 236 C116 246 84 246 69 236 C63 222 63 206 69 188 Z",
  },
  {
    // Arm
    d: "M48 64 C38 70 33 80 32 96 C30 130 29 165 28 200 C27 222 30 234 38 238 C45 240 49 232 49 220 C50 190 51 155 53 120 C55 95 57 78 56 70 C54 63 51 62 48 64 Z",
    mirror: true,
  },
  {
    // Leg
    d: "M70 215 C62 250 60 285 64 315 C60 355 61 390 65 410 C66 424 72 428 79 426 C86 424 87 414 86 402 C88 368 88 340 85 318 C92 285 94 250 92 220 C85 226 76 222 70 215 Z",
    mirror: true,
  },
];

export const BODY_REGIONS: Record<BodyView, BodyRegion[]> = {
  front: [
    {
      muscle: "neck",
      d: "M91 46 L109 46 C110 54 112 58 116 61 C106 66 94 66 84 61 C88 58 90 54 91 46 Z",
    },
    {
      muscle: "traps",
      d: "M88 52 C80 56 70 60 63 64 C72 66 82 66 89 64 C88 60 88 56 88 52 Z",
      mirror: true,
    },
    {
      muscle: "front delts",
      d: "M55 68 C60 64 66 64 69 68 C68 78 64 86 58 90 C53 84 52 75 55 68 Z",
      mirror: true,
    },
    {
      muscle: "middle delts",
      d: "M52 68 C44 70 38 78 37 88 C37 94 40 97 44 96 C50 92 53 82 53 74 C53 71 53 69 52 68 Z",
      mirror: true,
    },
    {
      muscle: "chest",
      d: "M98 72 C84 70 72 74 67 80 C62 92 66 104 74 110 C84 114 94 112 98 108 Z",
      mirror: true,
    },
    {
      muscle: "biceps",
      d: "M43 100 C49 96 55 98 56 104 C57 120 55 134 51 142 C46 145 41 142 40 136 C39 122 40 110 43 100 Z",
      mirror: true,
    },
    {
      muscle: "forearms",
      d: "M39 150 C44 146 50 147 52 152 C51 172 47 192 42 208 C38 212 33 210 32 204 C33 184 35 165 39 150 Z",
      mirror: true,
    },
    {
      muscle: "abs",
      d: "M85 116 C95 112 105 112 115 116 C118 140 116 164 111 184 C104 189 96 189 89 184 C84 164 82 140 85 116 Z",
    },
    {
      muscle: "obliques",
      d: "M82 118 C76 114 70 116 68 122 C66 142 68 158 72 168 C76 172 81 170 83 166 C79 150 79 134 82 118 Z",
      mirror: true,
    },
    {
      muscle: "abductors",
      d: "M60 197 C56 200 53 208 54 220 C55 230 58 236 61 236 C64 231 65 220 64 208 C63 200 62 197 60 197 Z",
      mirror: true,
    },
    {
      muscle: "adductors",
      d: "M95 220 C91 220 89 226 88 236 C87 253 89 267 92 275 C95 278 97 275 97 269 C98 251 97 234 95 220 Z",
      mirror: true,
    },
    {
      muscle: "quadriceps",
      d: "M70 212 C76 205 83 207 87 214 C90 240 89 272 84 298 C79 305 72 305 68 298 C63 270 64 238 70 212 Z",
      mirror: true,
    },
    {
      muscle: "calves",
      d: "M67 320 C73 314 81 315 84 322 C86 348 84 372 79 392 C75 397 69 396 67 390 C62 368 63 342 67 320 Z",
      mirror: true,
    },
  ],
  back: [
    {
      muscle: "traps",
      d: "M100 46 C92 52 78 58 64 63 C76 67 86 68 92 72 C96 84 98 96 100 108 C102 96 104 84 108 72 C114 68 124 67 136 63 C122 58 108 52 100 46 Z",
    },
    {
      muscle: "rear delts",
      d: "M52 68 C43 70 37 79 37 89 C38 95 42 97 46 95 C52 90 55 80 54 72 C54 69 53 68 52 68 Z",
      mirror: true,
    },
    {
      muscle: "triceps",
      d: "M43 100 C49 97 55 99 56 105 C56 121 54 135 50 143 C45 146 40 142 39 136 C39 122 40 110 43 100 Z",
      mirror: true,
    },
    {
      muscle: "forearms",
      d: "M39 150 C44 146 50 147 52 152 C51 172 47 192 42 208 C38 212 33 210 32 204 C33 184 35 165 39 150 Z",
      mirror: true,
    },
    {
      muscle: "upper back",
      d: "M96 76 C84 76 72 80 66 86 C67 96 72 104 80 108 C86 110 92 110 96 108 Z",
      mirror: true,
    },
    {
      muscle: "lats",
      d: "M94 112 C82 110 71 112 67 116 C69 138 76 154 84 163 C87 165 90 164 91 160 C89 144 90 127 94 112 Z",
      mirror: true,
    },
    {
      muscle: "lower back",
      d: "M92 150 C97 146 103 146 108 150 C111 165 110 180 106 190 C102 194 98 194 94 190 C90 180 89 165 92 150 Z",
    },
    {
      muscle: "glutes",
      d: "M97 194 C84 190 72 194 68 202 C64 216 68 230 76 236 C86 240 95 238 97 232 Z",
      mirror: true,
    },
    {
      muscle: "hamstrings",
      d: "M68 244 C74 238 84 238 88 244 C92 268 91 288 86 304 C80 310 70 310 66 303 C61 285 62 264 68 244 Z",
      mirror: true,
    },
    {
      muscle: "calves",
      d: "M66 318 C72 310 82 311 85 320 C88 346 85 372 79 392 C74 398 68 396 66 389 C61 366 62 340 66 318 Z",
      mirror: true,
    },
  ],
};

// Muscle groups that appear in at least one diagram; everything else
// (e.g. "other", "olympic", "full-body") is surfaced in a text list instead.
export const DRAWABLE_MUSCLES: ReadonlySet<string> = new Set(
  Object.values(BODY_REGIONS).flatMap((regions) =>
    regions.map((region) => region.muscle),
  ),
);
