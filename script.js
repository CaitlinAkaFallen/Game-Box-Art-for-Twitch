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
  const clientId = "CLIENT_ID_HERE";

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
  const oauthToken = "OAUTH_TOKEN_HERE";

  // 👉 Twitch Username:
  // This is the account you want to fetch stream or game data for.
  const username = "TWITCH_USERNAME_HERE";

  // === HTML Elements ===
  const streamTitleEl = document.getElementById("streamTitle");
  const gameTitleEl = document.getElementById("game-title");
  const gameCoverEl = document.getElementById("game-cover");
  const weekdayStatusEl = document.getElementById("weekday-status");
  const dateEl = document.getElementById("date");
  const nextStreamEl = document.getElementById("next-stream"); // <-- Add this in your HTML

  // ==============================
  //  🎮 FETCH TWITCH STREAM DATA
  // ==============================
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

  // ==============================
  //  📅 DATE DISPLAY
  // ==============================
  function updateDateDisplay() {
    const now = new Date();
    const weekdayName = now.toLocaleDateString(undefined, { weekday: "long" });
    const fullDate = now.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
    if (weekdayStatusEl) weekdayStatusEl.textContent = weekdayName;
    if (dateEl) dateEl.textContent = fullDate;
  }

  // ==============================
  //  🔔 NEXT STREAM DETECTOR
  // ==============================
  function detectNextStreamDay() {
    // Your fixed streaming days (0=Sunday, 1=Monday, 2=Tuesday,3=Wednesday, 4=Thursday. 5= Friday ,6=Saturday)
    const streamDays = [3, 5, 6]; // Wednesday, Friday, Saturday  // You can change  to what you stream days by the numbers only

    const now = new Date();
    const today = now.getDay();

    // Find the next upcoming stream day
    let nextStreamDay = streamDays.find(day => day > today);
    if (nextStreamDay === undefined) nextStreamDay = streamDays[0]; // Loop back to next week

    // Calculate date of next stream
    const daysUntilNext = (nextStreamDay + 7 - today) % 7 || 7;
    const nextStreamDate = new Date(now);
    nextStreamDate.setDate(now.getDate() + daysUntilNext);

    const dayName = nextStreamDate.toLocaleDateString(undefined, { weekday: "long" });
    const dateStr = nextStreamDate.toLocaleDateString(undefined, { month: "long", day: "numeric" });

    // Update display element
    if (nextStreamEl) {
      nextStreamEl.textContent = `🎥 Upcoming Stream: ${dayName}, ${dateStr}`;
    }
  }

  // === INITIALIZE ===
  updateDateDisplay();
  detectNextStreamDay();
  await fetchTwitchStreamData();

  // Refresh every 5 minutes
  setInterval(fetchTwitchStreamData, 5 * 60 * 1000);
});
