import { notifications, playeranimeinfo, userlists, userprofile } from "./anilistqueries";
import { toast } from 'sonner';

const GraphQlClient = async (token, query, variables) => {
    try {
        const response = await fetch("https://graphql.anilist.co/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: 'application/json',
                ...(token && { Authorization: "Bearer " + token }),
            },
            body: JSON.stringify({ query, variables }),
        });
        return response.json();
    } catch (error) {
        console.log("An error occurred, please try again later")
    }
};


export const Usernotifications = async (token, currentPage) => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: "Bearer " + token,
            },
            body: JSON.stringify({
                query: notifications,
                variables: {
                    page: currentPage,
                    perPage: 15,
                },
            }),
        },);
        const data = await response.json();
        // console.log(data)
        return data.data.Page;
    } catch (error) {
        console.error('Error fetching notifications from AniList:', error);
    }
}


export const WatchPageInfo = async (token, animeid) => {
    try {
        const response = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token && { Authorization: "Bearer " + token }),
            },
            body: JSON.stringify({
                query: playeranimeinfo,
                variables: {
                    id: animeid,
                },
            }),
        }, { next: { revalidate: 3600 } });

        const data = await response.json();
        return data.data.Media;
    } catch (error) {
        console.error('Error fetching data from AniList:', error);
    }
}

export const getUserLists = async (token, id) => {
    const res = await GraphQlClient(token, userlists, { id });
    return res?.data?.Media?.mediaListEntry;
};

export const saveProgress = async (token, id, progress, totalEpisodes = null) => {
  if (!token) {
    return;
  }

  const checkStatusQuery = `
  query($mediaId: Int) {
      Media(id: $mediaId) {
          mediaListEntry {
              status
              progress
          }
      }
  }
  `;

  try {
    const data = await GraphQlClient(token, checkStatusQuery, { mediaId: id });
    const entry = data?.data?.Media?.mediaListEntry;

    let status = "CURRENT";
    if (totalEpisodes && progress >= totalEpisodes) {
        status = "COMPLETED";
    }

    // If user has completed or is rewatching (REPEATING), do not update
    if (entry?.status === "COMPLETED" || entry?.status === "REPEATING") {
      return;
    }

    // If progress is greater than current (avoids rewinding progress)
    if (entry?.progress > progress) {
      return;
    }

    // If progress is same and status is same, do not update
    if (entry?.progress === progress && entry?.status === status) {
      return;
    }

    const updatelistprogress = `
    mutation($mediaId: Int, $progress: Int, $status: MediaListStatus) {
      SaveMediaListEntry(mediaId: $mediaId, progress: $progress, status: $status) {
        id
        mediaId
        progress
        status
      }
    }
  `;
  const variables = {
    mediaId : id,
    progress: progress,
    status: status
  }
  
    const res = await GraphQlClient(token, updatelistprogress, variables);
    if (res?.data?.SaveMediaListEntry) {
        toast.success(`Episode ${progress} saved successfully`);
    } else if (res?.errors) {
        toast.error("Failed to save progress to AniList");
    }
  } catch (error) {
    toast.error("An error occurred while updating list");
  }
}

export const UserProfile = async (token, username) => {
    try {
        const res = await GraphQlClient(token, userprofile, { username });
        if (!res || !res.data || !res.data.MediaListCollection) {
            console.error("UserProfile: Failed to fetch data", res?.errors);
            return null;
        }
        return res.data.MediaListCollection;
    } catch (err) {
        console.error("UserProfile Error:", err);
        return null; 
    }
}