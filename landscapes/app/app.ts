import type { Answer, Result, Sources } from './app.contract.d.ts';
// The landmarks and collections of Apple's sample, whose notice is LICENSE-APPLE.txt
import data from './data/landmarks.json';

// app.json’s app.id: change the two together.
export const appId = 'com.example.landscapes';
export const grants = 'device.geolocation locationPurpose';

type Collection = Result<'loadCollections'>[number];

// The collections live in memory, as the sample's `ModelData` keeps them:
// a launch starts from the sample's again.
let collections: Collection[] = data.collections.map((c) => ({ ...c, landmarkIds: [...c.landmarkIds] }));
const ok = (id = '') => ({ ok: true, id });
const edit = (id: string, change: (c: Collection) => Collection) => {
  collections = collections.map((c) => (c.id === id ? change(c) : c));
  return ok(id);
};

const sources: Sources = {
  loadData: (): Result<'loadData'> => ({ landmarks: data.landmarks }),
  loadCollections: (): Result<'loadCollections'> => collections,
  // The sample's `addUserCollection`: the next id after the highest, with its placeholder text.
  addCollection: () => {
    const id = String(Math.max(1001, ...collections.map((c) => Number(c.id))) + 1);
    collections = [...collections, { id, name: 'New Collection', description: 'Add a description for your collection here…', landmarkIds: [] }];
    return ok(id);
  },
  rename: ([id, name]) => edit(id, (c) => ({ ...c, name })),
  describe: ([id, description]) => edit(id, (c) => ({ ...c, description })),
  // In, it goes at the end, as the sample appends it; out, the rest keep their order.
  toggleMember: ([id, landmark]) => edit(id, (c) => ({
    ...c,
    landmarkIds: c.landmarkIds.includes(landmark) ? c.landmarkIds.filter((l) => l !== landmark) : [...c.landmarkIds, landmark],
  })),
  removeCollection: ([id]) => {
    collections = collections.filter((c) => c.id !== id);
    return ok(id);
  },
};
export const answer: Answer = (source, args, store, storage, native) =>
  sources[source](args, store, storage, native);
