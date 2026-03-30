import { getSignedUrl } from '../services/storage.service';

export interface ProjectWithImages {
  thumbnailKey: string | null;
  images: { id: string; storageKey: string; orderIndex: number }[];
  [key: string]: unknown;
}

export const withUrls = async (project: ProjectWithImages) => {
  const [thumbnailUrl, images] = await Promise.all([
    project.thumbnailKey ? getSignedUrl(project.thumbnailKey) : Promise.resolve(null),
    Promise.all(project.images.map(async (img) => ({ ...img, imageUrl: await getSignedUrl(img.storageKey) }))),
  ]);
  return { ...project, thumbnailUrl, images };
};
