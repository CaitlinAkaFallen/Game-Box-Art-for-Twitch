document.addEventListener("DOMContentLoaded", async function () {
  // ==============================
  //  🔧 TWITCH API CONFIGURATION
  // ==============================

  // 👉 Client ID:
  // Obtain this from your Twitch Developer Console:
  // https://dev.twitch.tv/console/apps
  //
  // When creating your app:
  // - Name it something relevant
  // - Add a valid OAuth Redirect URL (e.g., http://localhost)
  // - Set the category to "Web Integration"
  // - Client Type: Confidential
  // This ID identifies your Twitch application.
  //- Client Secret: Keep this private! But use it to generate OAuth tokens on https://twitchtokengenerator.com
  const clientId = "gp762nuuoqcoxypju8c569th9wz7q5";

  // 👉 OAuth Token:
  // Generate this at:
  // https://twitchtokengenerator.com
  //
  // When generating your token:
  // - Use the same Client ID and Secret from your Twitch Developer app
  // - Make sure to include these scopes:
  //   • user:read:email
  //   • channel:read:stream_key
  //
  // This token allows your app to access Twitch API data securely.
  const oauthToken = "0s89vmye9hk95jiifrpion53n6cy9p";

  // 👉 Twitch Username:
  // This is the account you want to fetch stream or game data for.
  const username = "fallenoneart";

  // === HTML Elements ===

  const streamTitleEl = document.getElementById("streamTitle");
  const gameTitleEl = document.getElementById("game-title");
  const gameCoverEl = document.getElementById("game-cover");

  // === Twitch API Fetch ===
  async function fetchTwitchStreamData() {
    try {
      // --- Get User ID ---
      const userResp = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, {
        headers: { "Client-ID": clientId, "Authorization": `Bearer ${oauthToken}` },
      });
      const userData = await userResp.json();
      if (!userData.data?.length) return console.error("User not found on Twitch.");
      const userId = userData.data[0].id;

      // --- Get Channel Info (title, game id, etc.) ---
      const channelResp = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`, {
        headers: { "Client-ID": clientId, "Authorization": `Bearer ${oauthToken}` },
      });
      const channelData = await channelResp.json();
      if (!channelData.data?.length) return console.error("No channel info found.");

      const channelInfo = channelData.data[0];
      const streamTitle = channelInfo.title;
      const gameTitle = channelInfo.game_name;
      const gameId = channelInfo.game_id;

      // --- Update HTML elements ---
      streamTitleEl.textContent = streamTitle;
      gameTitleEl.textContent = gameTitle;

      if (gameId) {
        gameCoverEl.src = `https://static-cdn.jtvnw.net/ttv-boxart/${gameId}-285x380.jpg`;
        gameCoverEl.style.display = "block";
      } else {
        gameCoverEl.style.display = "none";
      }
    } catch (error) {
      console.error("Error fetching Twitch data:", error);
    }
  }

  // === Date Display ===
  function updateDateDisplay() {
    const now = new Date();
    const weekdayName = now.toLocaleDateString(undefined, { weekday: "long" });
    const fullDate = now.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    document.getElementById("weekday-status").textContent = weekdayName;
    document.getElementById("date").textContent = fullDate;
  }

  updateDateDisplay();
  await fetchTwitchStreamData();

  // Optionally refresh Twitch info every 5 minutes
  setInterval(fetchTwitchStreamData, 5 * 60 * 1000);
});






